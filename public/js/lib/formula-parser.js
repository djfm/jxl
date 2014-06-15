function tokenizeFormula(str) {
	var tokens = [];

	var bits = [];
	var bit = '';

	function tokenize(str, matchers, m) {
		if (m === undefined) {
			m = 0;
		}
		if (m >= matchers.length) {
			return false;
		}
		var tokens = [];
		var parts = str.split(matchers[m].exp);

		for (var p = 0; p < parts.length; p++) {
			var part = parts[p].trim();
			if (part !== '') {
				if (part.match(matchers[m].exp)) {
					tokens.push({type: matchers[m].type, value: part});
				} else {
					var tok = tokenize(part, matchers, m + 1);
					if (tok) {
						tokens = tokens.concat(tok);
					} else {
						return false;
					}
				}
			}
		}

		return tokens;
	}

	function acceptBit() {
		if (bit !== '') {
			bits.push(bit);
		}
		bit = '';
	}

	function acceptString() {
		bits.push({type: 'string', value: bit});
		bit = '';
	}

	// First, extract the strings
	var state = null;
	for (var i = 0; i < str.length; i++) {

		var c = str[i];

		if (state === null) {
			if (c === '"') {
				acceptBit();
				state = 'string';
			} else {
				bit += c;
			}
		} else if (state === 'string') {
			if (c === '"') {
				acceptString();
				state = null;
			} else if (c === '\\') {
				state = 'escape';
			} else {
				bit += c;
			}
		} else if (state === 'escape') {
			if (c === '"') {
				bit += '"';
			} else {
				bit += '\\' + c;
			}
			state = 'string';
		}
	}

	if (state !== null) {
		return false;
	}

	// If there is stuff in the buffer, take it
	acceptBit();

	for (var b = 0; b < bits.length; b++) {
		if (typeof bits[b] === 'string') {
			var tok = tokenize(bits[b], [
				{exp: /((?:\b|\$)[A-Z]+\$?\d*(?::\$?[A-Z]+\$?\d*)?\b)/, type: 'reference'},
				{exp: /(\b\d+(?:\.\d+)?\b)/, type: 'number'},
				{exp: /(\w+)/, type: 'identifier'},
				{exp:/(<>)/, type: 'operator'},
				{exp:/([+\-*/!=<>])/, type: 'operator'},
				{exp:/(\()/, type: 'oparen'},
				{exp:/(\))/, type: 'cparen'},
				{exp:/(,)/, type: 'comma'},
			]);
			if (tok) {
				tokens = tokens.concat(tok);
			} else {
				return false;
			}
		} else {
			tokens.push(bits[b]);
		}
	}

	return tokens;
}

function FormulaTreeNode(object, parent, left, right, rules) {
	this.children = [];
	this.object = object;
	this.operators = [];

	this.replaceWith = function(node) {
		for (var i = 0; i < node.children.length; i++) {
			node.children[i].setParent(this);
		}
		this.children = node.children;
		this.object = node.object;
		this.operators = node.operators;
	};

	this.pushChild = function(object) {
		this.children.push(new FormulaTreeNode(object, this, this.children[this.children.length - 1], null, rules));
		if (this.children[this.children.length - 2]) {
			this.children[this.children.length - 2].setRight(this.children[this.children.length - 1]);
		}
		if (object.type === 'operator') {
			var prec = rules.precedence[object.value];
			if (prec) {
				if (!this.operators[prec[0]]) {
					this.operators[prec[0]] = [];
				}
				this.operators[prec[0]].push({
					node: this.children[this.children.length - 1],
					needLeft: prec[1],
					needRight: prec[2]
				});
			}
		}

		return this.children[this.children.length - 1];
	};

	this.setRight = function(obj) {
		right = obj;
		return this;
	};

	this.getRight = function() {
		return right;
	};

	this.setLeft = function(obj) {
		left = obj;
		return this;
	};

	this.getLeft = function() {
		return left;
	};

	this.setParent = function(obj) {
		parent = obj;
		return this;
	};

	this.getParent = function() {
		return parent;
	};

	this.deeper = function() {
		return this.pushChild("grouping");
	};

	this.shallower = function() {
		if (parent) {
			return parent;
		} else {
			throw "Too many closing parentheses?";
		}
	};

	this.removeUselessGroupings = function() {
		for (var i = 0; i < this.children.length; i++) {
			this.children[i].removeUselessGroupings();
		}
		if (this.object === "grouping" && this.children.length === 1 && this.children[0].object === "grouping") {
			this.replaceWith(this.children[0]);
		}
	};

	this.buildFunctionCalls = function() {
		var i;

		for (i = 0; i < this.children.length; i++) {
			this.children[i].buildFunctionCalls();
		}
		for (i = 1; i < this.children.length; i++) {
			var child = this.children[i];
			var prev = this.children[i-1];
			if (child.object === 'grouping' && prev.object.type === 'identifier') {
				child.object = {type: 'application', operator: prev.object, children: child.children};
				prev.setRight(child.getRight());
				prev.replaceWith(child);
				this.children.splice(i, 1);
				i--;
			}
		}
	};

	this.applyPrecedenceRules = function() {
		var i;

		for (i = 0; i < this.children.length; i++) {
			this.children[i].applyPrecedenceRules();
		}

		for (var p = 0; p < this.operators.length; p++) {
			var ops = this.operators[p];
			if (ops) {
				for(var o = 0; o < ops.length; o++) {
					var op = ops[o];
					var operands = [];

					var leftMost = op.node;
					for (var l = 0; l < op.needLeft; l++) {
						leftMost = leftMost.getLeft();
						if (leftMost) {
							operands.unshift(leftMost.object);
							leftMost.toKill = true;
						} else {
							throw "Missing operand to the left!";
						}
					}

					var rightMost = op.node;
					for (var r = 0; r < op.needRight; r++) {
						rightMost = rightMost.getRight();
						if (rightMost) {
							operands.push(rightMost.object);
							rightMost.toKill = true;
						} else {
							throw "Missing operand to the right!";
						}
					}

					op.node.object = {type: 'application', operator: op.node.object, operands: operands};

					if (leftMost.getLeft()) {
						leftMost.getLeft().setRight(op.node);
					}

					if (rightMost.getRight()) {
						rightMost.getRight().setLeft(op.node);
					}

					op.node.setRight(rightMost.getRight());
					op.node.setLeft(leftMost.getLeft());

					for (i = 0; i < this.children.length;) {
						if (this.children[i].toKill) {
							delete this.children[i].toKill;
							this.children.splice(i, 1);
						} else {
							i++;
						}
					}
				}
				delete this.operators[p];
			}
		}
	};

	this.buildFinalExpression = function() {
		if (this.children.length !== 1) {
			throw "Parse error, could not reduce to an expression!";
		}

		var obj = this.children[0].object;

		function clean(tree) {
			if (tree.type === 'application') {
				if (tree.operands) {
					for (var i = 0; i < tree.operands.length; i++) {
						clean(tree.operands[i]);
					}
				}
				else if (tree.children) {
					tree.operands = [];
					for (var c = 0; c < tree.children.length; c++) {
						clean(tree.children[c].object);
						tree.operands.push(tree.children[c].object);
					}
					delete tree.children;
				}
			}
		}

		clean(obj);

		return obj;
	};
}

function parseFormula(str) {
	var tokens = tokenizeFormula(str);
	if (!tokens) {
		return false;
	}

	var tree = new FormulaTreeNode(null, null, null, null, {
		precedence: {
			'!':  [0, 0, 1],
			'/':  [1, 1, 1],
			'*':  [2, 1, 1],
			'-':  [3, 1, 1],
			'+':  [4, 1, 1],
			'<':  [5, 1, 1],
			'>':  [6, 1, 1],
			'<>': [7, 1, 1],
			'=':  [8, 1, 1]
		}
	});

	for (var t = 0; t < tokens.length; t++) {
		if (tokens[t].type === 'comma') {
			continue;
		} else if (tokens[t].type === 'oparen') {
			tree = tree.deeper();
		} else if (tokens[t].type === 'cparen') {
			tree = tree.shallower();
		} else {
			tree.pushChild(tokens[t]);
		}
	}

	if (tree.getParent()) {
		throw "Missing closing parenthesis?";
	}

	tree.removeUselessGroupings();
	tree.buildFunctionCalls();
	tree.applyPrecedenceRules();

	var exp = tree.buildFinalExpression();

	//console.log(JSON.stringify(tree, undefined, "\t"));
	//console.log(JSON.stringify(exp, undefined, "\t"));

	return exp;
}

if (typeof module !== 'undefined') {
	module.exports.tokenize = tokenizeFormula;
	module.exports.parse = parseFormula;
}
