var CellTextEditor = (function(){
	function isNumber(n) {
		return !isNaN(parseFloat(n)) && isFinite(n);
	}

	function CTE(element) {
		TextEditor.call(this, $(element).find('div.inner').get(0));

		this.canCompleteRange = function() {
			return true;
		};

		this.highlighter = function(text) {

			if (isNumber(text)) {
				return {
					string: text,
					klass: 'number'
				};
			}

			return text;
		};

		this.super_activate = this.activate;

		this.activate = function(content) {
			this.super_activate('div.bigtable-cell', content);
		};
	}

	CTE.prototype = Object.create(TextEditor);
	return CTE;
}());
