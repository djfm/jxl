var jxl;

(function(){
	function JXL() {
		var my = this;

		var workbooks = {};
		var functions = {};

		this.init = function() {
			$('div.workbook').each(function(i, div) {
				new Workbook(div);
			});
		};

		this.fetchWorkbook = function(name, cb) {
			$.get('/workbooks/' + name + '/data', function(resp) {
					var workbook = new WorkbookModel(resp);
					workbooks[name] = workbook;
					cb(workbook);
			});
		};

		this.commit = function() {
			console.log(arguments);
			var book, sheet, row, col, value;
			if (arguments[0] === 'cellValue') {
				book = arguments[1];
				sheet = arguments[2];
				row = arguments[3];
				col = arguments[4];
				value = arguments[5];
				workbooks[book].getWorksheet(sheet).getCellModel(row, col).setValue(value);
			} else if (arguments[0] === 'cellFormula') {
				book = arguments[1];
				sheet = arguments[2];
				row = arguments[3];
				col = arguments[4];
				value = arguments[5];
				workbooks[book].getWorksheet(sheet).getCellModel(row, col).setFormula(value);
			}
		};

		this.registerFunction = function(name, nargs, fn) {
			functions[name] = {
				nargs: nargs,
				fn: fn
			};
		};

		this.evaluate = function(workbookName, worksheetId, row, col, formula, deep) {
			try {
				var expression = deep ? formula : parseFormula(formula);

				if (expression.type === 'application') {
					var f = functions[expression.operator.value];
					if (f) {
						var operands = [];
						for (var o = 0; o < expression.operands.length; o++) {
							operands.push(this.evaluate(workbookName, worksheetId, row, col, expression.operands[o], true));
						}
						return f.fn.apply(this, operands);
					}

				} else if (expression.type === 'number') {
					return parseFloat(expression.value);
				} else if (expression.type === 'reference') {
					return workbooks[workbookName].getWorksheet(worksheetId).getValueForReference(expression.value);
				}

				return "NIY";
			} catch (e) {
				if (deep) {
					throw e;
				} else {
					console.log(e);
					return '#ERR';
				}
			}
		};
	}
	jxl = new JXL();
}());

$(document).ready(function(){
	jxl.init();

	jxl.registerFunction('+', 2, function(a, b) {
		return parseFloat(a) + parseFloat(b);
	});

	jxl.registerFunction('-', 2, function(a, b) {
		return parseFloat(a) - parseFloat(b);
	});

	jxl.registerFunction('*', 2, function(a, b) {
		return parseFloat(a) * parseFloat(b);
	});

	jxl.registerFunction('/', 2, function(a, b) {
		return parseFloat(a) / parseFloat(b);
	});

	function sum(v) {
		if (typeof v === 'number') {
			return v;
		} else if (typeof v === 'undefined') {
			return 0;
		} else if (v === null) {
			return 0;
		} else if (Object.prototype.toString.call(v) === '[object Array]' || Object.prototype.toString.call(v) === '[object Arguments]') {
			var s = 0;
			for (var i = 0; i < v.length; i++) {
				s += sum(v[i]);
			}
			return s;
		} else {
			return parseFloat(v);
		}
	}

	jxl.registerFunction('sum', null, function() {
		return sum(arguments);
	});
});
