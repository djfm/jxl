function WorksheetModel(data) {
	var table;
	var workbookModel;
	var cells = {};
	var focusedCell, activeCell;
	var focusedCellRow, activeCellRow;
	var focusedCellCol, activeCellCol;
	var worksheetId;

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
		return this;
	};

	this.setWorkbookModel = function(wb) {
		workbookModel = wb;
		return this;
	};

	this.setWorksheetId = function(id) {
		worksheetId = id;
		return this;
	};

	this.rowRendered = function(row, cellElements) {
		if (!cells[row]) {
			cells[row] = {};
		}

		for (var col = 0; col < cellElements.length; col++) {
			cells[row][col] = cellElements[col];
		}

		if (row == focusedCellRow) {
			this.focusCell(focusedCellRow, focusedCellCol);
		}
	};

	this.rowDisappeared = function(row, cells) {
		delete cells[row];
	};

	this.cellClicked = function(event, row, col) {
		this.focusCell(row, col);
	};

	this.lock = function(prop, value) {
		return workbookModel.lock(worksheetId, prop, value);
	};

	this.owns = function(prop) {
		return workbookModel.owns(worksheetId, prop);
	};

	this.focusCell = function(row, col) {
		if (focusedCell) {

			if (focusedCell.get(0) === cells[row][col]) {
				return;
			}

			if (focusedCell.get(0).textEditor) {
				focusedCell.get(0).textEditor.deactivate();
			}
			focusedCell.removeClass('focused');
		}
		focusedCell = $(cells[row][col]);
		focusedCell.addClass('focused');
		focusedCellRow = row;
		focusedCellCol = col;
		var fc = focusedCell.get(0);
		if (!fc.textEditor) {
			fc.textEditor = new TextEditor(focusedCell.find('div.inner').get(0));
			fc.textEditor.init();
		}
		fc.textEditor.activate('div.bigtable-cell');
	};

	this.canStartSelectionAt = function(row, col) {
		return row != focusedCellRow || col != focusedCellCol;
	};

	this.commitSelection = function(topRow, topCol, bottomRow, bottomCol) {
	};

	this.preselect = function(topRow, topCol, bottomRow, bottomCol) {
	};

	this.keyboardEvent = function(eventType, e) {
		if (focusedCell) {
			var textEditor = focusedCell.get(0).textEditor;

			if (textEditor) {
				if (eventType === 'keydown') {
					if (e.keyCode === 8) { // backspace
						textEditor.backspace();
						e.preventDefault();
					} else if (e.keyCode === 27) { // escape
						e.preventDefault();
					} else if (e.keyCode === 13) { // return
						e.preventDefault();
					}
					else if (e.keyCode === 32) { // space
						textEditor.insertChar('&nbsp;');
						e.preventDefault();
					}
					else if (e.keyCode === 37) { // left
						textEditor.moveLeft();
						e.preventDefault();
					}
					else if (e.keyCode === 39) { // right
						textEditor.moveRight();
						e.preventDefault();
					}
				} else if (eventType === 'keypress') {
					if (e.which !== 0) {
						var text = String.fromCharCode(e.which);
						textEditor.insert(text);
					}
				}
			}
		}
	};
}
