function WorksheetModel(data) {
	var table;
	var workbookModel;
	var cells = {};
	var worksheetId;
	var focusedCell, focusedCellRow, focusedCellCol;
	var formulaCell, formulaCellRow, formulaCellCol;

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

			if (row != focusedCellRow || row != formulaCellRow || col != formulaCellCol || col || focusedCellCol ) {
				this.updateCellFromModel(row, col);
			}
		}

		if (focusedCell && row == focusedCellRow) {
			$(cells[row][focusedCellCol]).replaceWith(focusedCell);
			cells[row][focusedCellCol] = focusedCell.get(0);
		}

		if (formulaCell && row == formulaCellRow) {
			$(cells[row][formulaCellCol]).replaceWith(formulaCell);
			cells[row][formulaCellCol] = formulaCell.get(0);
		}
	};

	this.updateCellFromModel = function(row, col) {
		var model = this.getCellModel(row, col);
		var value = model.getValue();
		var cell = cells[row][col];
		var $cell = $(cell);
		if (value) {
			cell.textEditor = new CellTextEditor(cell);
			cell.textEditor.init(value);
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

	this.unlock = function(prop) {
		return workbookModel.unlock(worksheetId, prop);
	};

	this.owns = function(prop) {
		return workbookModel.owns(worksheetId, prop);
	};

	this.focusCell = function(row, col) {
		if (focusedCell) {
			if (focusedCell.get(0) === cells[row][col]) {
				var te = focusedCell.get(0).textEditor;
				if (te && !te.isActive()) {
					te.activate('div.bigtable-cell');
					this.checkForFormula();
				}
				return;
			}

			if (focusedCell.get(0).textEditor && !formulaCell) {
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
			fc.textEditor = new CellTextEditor(focusedCell.get(0));
			fc.textEditor.init();
		}
		if (!formulaCell) {
			fc.textEditor.activate('div.bigtable-cell');
			fc.textEditor.onchange = this.inputCellChanged.bind(this);
			this.checkForFormula();
		}
	};

	this.checkForFormula = function() {
		var cell = formulaCell || focusedCell;

		var text = cell.get(0).textEditor.getText();
		if (text[0] === '=' && !formulaCell) {
			this.lock('keyboard');
			formulaCell = focusedCell;
			formulaCellRow = focusedCellRow;
			formulaCellCol = focusedCellCol;
		} else if (text[0] !== '=' && formulaCell) {
			this.unlock('keyboard');
			formulaCell = formulaCellRow = formulaCellCol = null;
		}
	};

	this.inputCellChanged = function(editor) {
		this.checkForFormula();
	};

	this.canStartSelectionAt = function(row, col) {
		return cells[row][col].textEditor ? !cells[row][col].textEditor.isActive() : true;
	};

	this.commitSelection = function(topRow, topCol, bottomRow, bottomCol) {
	};

	this.preselect = function(topRow, topCol, bottomRow, bottomCol) {
	};

	this.deactivateCell = function(cancel) {
		var cell = formulaCell || focusedCell;

		cell.get(0).textEditor.deactivate(cancel);

		var row = formulaCell ? formulaCellRow : focusedCellRow;
		var col = formulaCell ? formulaCellCol : focusedCellCol;

		if (formulaCell) {
			formulaCell = formulaCellRow = focusedCellCol = 0;
		} else {

		}

		if (!cancel) {
			jxl.commit('cellValue', workbookModel.getName(), worksheetId, row, col, cell.get(0).textEditor.getText());
		}
	};

	this.keyboardEvent = function(eventType, e) {
		var textEditor;

		if (formulaCell) {
			textEditor = formulaCell.get(0).textEditor;
		} else if (focusedCell) {
			textEditor = focusedCell.get(0).textEditor;
		}

		if (!textEditor.isActive()) {
			textEditor.activate('div.bigtable-cell');
		}

		if (textEditor) {
			if (eventType === 'keydown') {
				if (e.keyCode === 8) { // backspace
					textEditor.backspace();
					e.preventDefault();
				} else if (e.keyCode === 27) { // escape
					this.deactivateCell(true);
					e.preventDefault();
				} else if (e.keyCode === 13) { // return
					this.deactivateCell(false);
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
	};

	this.getCellModel = function(row, col) {
		if (!data.cells[row]) {
			data.cells[row] = {};
		}
		if (!data.cells[row][col]) {
			data.cells[row][col] = {};
		}
		return new CellModel(data.cells[row][col]);
	};

}
