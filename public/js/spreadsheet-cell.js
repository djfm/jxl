(function(){
	var SpreadsheetCell = function() {
		this.createdCallback = function() {
			this.innerHTML = "<text-editor></text-editor>";
			this.workbook = jxl.getWorkbook(this.getAttribute('data-workbook-name'));
			this.spreadsheet = this.workbook.getSheet(parseInt(this.getAttribute('data-spreadsheet-index')));
			this.spreadsheetElement = this.spreadsheet.getElement();
			this.editor = this.getElementsByTagName('text-editor')[0];

			this.row = parseInt(this.getAttribute('data-row'));
			this.col = parseInt(this.getAttribute('data-col'));

			var events = ['mousedown', 'mouseover', 'mouseup'];

			var me = this;

			function makeHandler(event_type) {
				return function(event) {
					if (me.spreadsheetElement[event_type]) {
						me.spreadsheetElement[event_type](event, me);
					}
				};
			}

			for (var e = 0; e < events.length; e++) {
				this.addEventListener(events[e], makeHandler(events[e]));
			}
			this.spreadsheetElement.registerCell(this);
		};

		this.keydown = function(e) {
			if (e.keyCode === 8) { // backspace
				this.editor.backspace();
				e.preventDefault();
			}
			else if (e.keyCode === 32) { // space
				this.editor.insertChar('&nbsp;');
				e.preventDefault();
			}
			else if (e.keyCode === 37) { // left
				this.editor.moveLeft();
				e.preventDefault();
			}
			else if (e.keyCode === 39) { // right
				this.editor.moveRight();
				e.preventDefault();
			}
			else if (e.keyCode === 13) { // return
				e.preventDefault();
			}
		};

		this.keypress = function(e){
			if (e.which !== 0) {
				var text = String.fromCharCode(e.which);
				this.editor.insert(text);
			}
		};
	};

	SpreadsheetCell.prototype = Object.create(HTMLElement.prototype);

	document.registerElement('spreadsheet-cell', {prototype: new SpreadsheetCell()});
})();
