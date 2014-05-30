(function(){
	var SpreadsheetCell = function() {
		this.createdCallback = function() {
			this.innerHTML = "<text-editor></text-editor>";
			this.spreadsheetElement = $(this).closest('x-spreadsheet').get(0);
			this.spreadsheet = this.spreadsheetElement.spreadsheet;

			this.row = parseInt(this.getAttribute('data-row'));
			this.col = parseInt(this.getAttribute('data-col'));

			this.spreadsheetElement.registerCell(this);

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
		};

		this.attachedCallback = function() {

		};

		/*this.markSelected = function() {
			$(this).addClass('selected');
			console.log(this);
		}*/
	};

	SpreadsheetCell.prototype = Object.create(HTMLElement.prototype);

	document.registerElement('spreadsheet-cell', {prototype: new SpreadsheetCell()});
})();
