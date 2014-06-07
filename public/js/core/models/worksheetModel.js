function WorksheetModel(data) {

	var table;

	this.activate = function() {
		table.willUpdateDisplay();
	};

	this.setTable = function(t) {
		table = t;
		t.onRowRendered = this.rowRendered.bind(this);
		t.onRowDisappeared = this.rowDisappeared.bind(this);
	};

	this.rowRendered = function(row, cells) {
		for( var col = 0; col < cells.length; col++) {
		}
	};

	this.rowDisappeared = function(row, cells) {

	};
}
