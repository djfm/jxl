var fp = require('../public/js/lib/formula-parser.js');
var assert = require('assert');

var tokenizerTests = {
	'"abcd"': [{type: 'string', value:'abcd'}],
	'"abcd': false,
	'"a\'bcd"': [{type: 'string', value:'a\'bcd'}],
	'"a\\"bcd"': [{type: 'string', value:'a"bcd'}],
	'A1': [{type: 'reference', value:'A1'}],
	'hello': [{type: 'identifier', value: 'hello'}],
	'123': [{type: 'number', value: '123'}],
	'1.23': [{type: 'number', value: '1.23'}],
	'+': [{type: 'operator', value: '+'}],
	'+2': [{type: 'operator', value: '+'}, {type: 'number', value: '2'}],
	'(': [{type: 'oparen', value: '('}],
	')': [{type: 'cparen', value: ')'}],
	',': [{type: 'comma', value: ','}],
	'<>': [{type: 'operator', value: '<>'}],
	'<><': [{type: 'operator', value: '<>'}, {type: 'operator', value: '<'}],
	'sum(A1:B12)': [{type: 'identifier', value: 'sum'},
					{type: 'oparen', value: '('},
					{type: 'reference', value: 'A1:B12'},
					{type: 'cparen', value: ')'}],
	'sum(A$1:$B12)': [{type: 'identifier', value: 'sum'},
					{type: 'oparen', value: '('},
					{type: 'reference', value: 'A$1:$B12'},
					{type: 'cparen', value: ')'}],
	'ucfirst("bob")': [{type: 'identifier', value: 'ucfirst'},
					{type: 'oparen', value: '('},
					{type: 'string', value: 'bob'},
					{type: 'cparen', value: ')'}],
	'ucfirst("bo\\"b")': [{type: 'identifier', value: 'ucfirst'},
					{type: 'oparen', value: '('},
					{type: 'string', value: 'bo"b'},
					{type: 'cparen', value: ')'}]
};

var parserTests = {
	'a + b * f(((1, 2)))': {
			type: 'application',
			operator: {type: 'operator', value: '+'},
			operands: [{type: 'identifier', value: 'a'}, {
				type: 'application',
				operator: {type: 'operator', value: '*'},
				operands: [
					{type: 'identifier', value: 'b'},
					{
						type: 'application',
						operator: {type: 'identifier', value: 'f'},
						operands: [
							{type: 'number', value: '1'},
							{type: 'number', value: '2'}
						]
					}
				]
			}]
		}
};

var ok = true;

try {
	for (var t in tokenizerTests) {
		assert.deepEqual(fp.tokenize(t), tokenizerTests[t], 'formula tokenizer fails on: ' + t);
	}

	for (var p in parserTests) {
		assert.deepEqual(fp.parse(p), parserTests[p], 'formula parser fails on: ' + p);
	}
} catch (e) {
	ok = false;
	throw e;
}

module.exports = ok;
