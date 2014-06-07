function WorksheetModel(data) {

	var table;

	this.activate = function() {
		table.willUpdateDisplay();
	};

	this.setTable = function(t) {
		table = t;
		t.onRowRendered = this.rowRendered.bind(this);
		t.onRowDisappeared = this.rowDisappeared.bind(this);
		t.onCellClicked = this.cellClicked.bind(this);
		t.canStartSelectionAt = this.canStartSelectionAt.bind(this);
		t.onCommitSelection = this.commitSelection.bind(this);
		t.onPreselect = this.preselect.bind(this);
	};

	this.rowRendered = function(row, cells) {
		for (var col = 0; col < cells.length; col++) {
		}
	};

	this.rowDisappeared = function(row, cells) {

	};

	this.cellClicked = function(event, row, col) {

	};

	this.canStartSelectionAt = function(row, col) {
		return true;
	};

	this.commitSelection = function(topRow, topCol, bottomRow, bottomCol) {
	};

	this.preselect = function(topRow, topCol, bottomRow, bottomCol) {
	};
}
