function WorksheetModel(data) {
	var table;
	var worksheetId;
	var workbookModel;
	var cells = {}, specialCells = {};

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

	this.colNameToNumber = function(col) {
		var base = 1;
		var n = 0;
		for (var i = 0; i < col.length; i++) {
			var d = col[col.length - 1 - i].charCodeAt(0) - 'A'.charCodeAt(0);
			n += base * d;
			base *= 26;
		}
		return n;
	};

	this.getValueForReference = function(ref) {
		var bits = ref.replace(/\$/g, '').match(/([A-Z]+)(\d*)(?::([A-Z]+)(\d*))?/);

		var topRow = parseInt(bits[2]);
		var topCol = this.colNameToNumber(bits[1]);

		if (bits[3] && bits[4]) {
			var bottomRow = parseInt(bits[4]);
			var bottomCol = this.colNameToNumber(bits[3]);

			var rows = [];

			for (var r = topRow; r <= bottomRow; r++) {
				var range = [];
				for (var c = topCol; c <= bottomCol; c++) {
					if (data.cells[r]) {
						range.push(data.cells[r][c].value);
					} else {
						range.push(null);
					}
				}
				rows.push(range);
			}

			return rows;
		} else {
			return data.cells[topRow][topCol].value;
		}
	};

	this.rowRendered = function(row, cellElements) {
		if (!cells[row]) {
			cells[row] = {};
		}

		for (var col = 0; col < cellElements.length; col++) {
			cells[row][col] = cellElements[col];

			var update = true;
			for (var c in specialCells) {
				var cell = specialCells[c];
				if (row == cell.row && col == cell.col)
				{
					update = false;
					$(cells[row][col]).replaceWith(cell);
					cells[row][col] = cell;
				}
			}
			if (update) {
				this.updateCellFromModel(row, col);
			}
		}
	};

	this.updateCellFromModel = function(row, col) {
		var model = this.getCellModel(row, col);
		var value = model.getValue();
		var cell = cells[row][col];
		var $cell = $(cell);
		if (value) {
			if (!cell.textEditor) {
				cell.textEditor = new CellTextEditor(cell);
			}
			cell.textEditor.init(value.toString());
		}
	};

	this.getCellModel = function(row, col) {
		if (!data.cells[row]) {
			data.cells[row] = {};
		}
		if (!data.cells[row][col]) {
			data.cells[row][col] = {};
		}
		return new CellModel(workbookModel.getName(), worksheetId, row, col, data.cells[row][col]);
	};

	this.rowDisappeared = function(row, cells) {
		delete cells[row];
	};

	this.cellClicked = function(event, row, col) {
		this.userInterestedByCell(row, col);
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

	this.canStartSelectionAt = function(row, col) {
		return !this.isSpecialCell(row, col, 'active');
	};

	this.commitSelection = function(topRow, topCol, bottomRow, bottomCol) {
	};

	this.preselect = function(topRow, topCol, bottomRow, bottomCol) {
		var tl = this.coordsToReference(topRow, topCol);
		var br = this.coordsToReference(bottomRow, bottomCol);
		var ref = tl === br ? tl : tl + ':' + br;
		if (specialCells.formula) {
			specialCells.formula.textEditor.insertCompletion(ref);
		}
	};

	this.coordsToReference = function(row, col) {
		return table.getColName(col) + row;
	};

	this.isSpecialCell = function(row, col, what) {
		if (what) {
			if (specialCells[what] && specialCells[what].row == row && specialCells[what].col == col) {
				return true;
			} else {
				return false;
			}
		} else {
			for (var c in specialCells) {
				var cell = specialCells[c];
				if (cell.row == row && cell.col == col) {
					return c;
				}
			}
			return false;
		}
	};

	this.setCellSpecial = function(row, col, what) {
		specialCells[what] = cells[row][col];
		specialCells[what].row = row;
		specialCells[what].col = col;
		return this;
	};

	this.userInterestedByCell = function(row, col) {
		if (this.isSpecialCell(row, col, 'focused')) {
			this.userWantsToActivateCell(row, col);
		} else {
			this.focusCell(row, col);
		}
	};

	this.userWantsToActivateCell = function(row, col) {
		if (this.isSpecialCell(row, col, 'active')) {
			// nothing to do
		} else if (specialCells.formula) {
			// nothing to do, formula cell has grabbed focus
		} else if (!this.owns('keyboard')) {
			// it is pointless to activate a cell if it cannot be written to
		} else {
			if (specialCells.active) {
				this.deactivateActiveCell(true);
			}
			this.activateCell(row, col);
		}
	};

	this.deactivateActiveCell = function(commit) {
		var text = specialCells.active.textEditor.getText();
		var row = specialCells.active.row, col = specialCells.active.col;

		specialCells.active.textEditor.deactivate(!commit);
		delete specialCells.active;

		if (commit) {
			jxl.commit(specialCells.formula ? 'cellFormula' : 'cellValue',
				workbookModel.getName(),
				worksheetId, row, col, text
			);
		}

		if (specialCells.formula) {

			this.updateCellFromModel(row, col);

			this.unlock('keyboard');
			delete specialCells.formula;
		}
	};

	this.activateCell = function(row, col, initialText) {
		var cell = cells[row][col];
		if (!cell.textEditor) {
			cell.textEditor = new CellTextEditor(cell);
		}

		var f;

		if (initialText === undefined) {
			f = this.getCellModel(row, col).getFormula();
		}

		if (f) {
			initialText = "=" + f;
		}

		cell.textEditor.activate(initialText);
		cell.textEditor.onchange = this.inputCellChanged.bind(this);
		this.setCellSpecial(row, col, 'active');

		if (f) {
			this.lock('keyboard');
			this.setCellSpecial(row, col, 'formula');
		} else {
			this.checkForFormula();
		}

		return true;
	};

	this.unfocusFocusedCell = function() {
		if (specialCells.focused) {
			$(specialCells.focused).removeClass('focused');
			delete specialCells.focused;
		}
	};

	this.focusCell = function(row, col) {
		if (specialCells.focused && (specialCells.focused.row != row || specialCells.focused.col != col)) {
			this.unfocusFocusedCell();
		}

		if (!specialCells.focused || specialCells.focused.row != row || specialCells.focused.col != col) {
			$(cells[row][col]).addClass('focused');
			this.setCellSpecial(row, col, 'focused');
		}
	};

	this.inputCellChanged = function(te) {
		this.checkForFormula();
	};

	this.checkForFormula = function() {
		var inputCell = specialCells.active;
		var text = inputCell.textEditor.getText();
		if (text[0] === '=') {
			if (!specialCells.formula) {
				this.lock('keyboard');
				this.setCellSpecial(inputCell.row, inputCell.col, 'formula');
			}
		} else {
			if (specialCells.formula) {
				this.unlock('keyboard');
				delete specialCells.formula;
			}
		}
	};

	this.keyboardEvent = function(eventType, e) {
		var inputCell = specialCells.active;

		if (eventType === 'keydown') {
			if (e.keyCode === 27) { // escape
				if (specialCells.active) {
					this.deactivateActiveCell(false);
					e.preventDefault();
				}
			} else if (e.keyCode === 13) { // return
				if (specialCells.active) {
					this.deactivateActiveCell(true);
					e.preventDefault();
				} else if (specialCells.focused) {
					this.userInterestedByCell(specialCells.focused.row, specialCells.focused.col);
					e.preventDefault();
				}
			} else if (e.keyCode === 8) { // backspace
				if (inputCell) {
					inputCell.textEditor.backspace();
					e.preventDefault();
				}
			} else if (e.keyCode === 37) { // left
				if (inputCell) {
					inputCell.textEditor.moveLeft();
					e.preventDefault();
				} else if (specialCells.focused) {
					if (specialCells.focused.col > 0) {
						this.userInterestedByCell(specialCells.focused.row, specialCells.focused.col - 1);
						e.preventDefault();
					}
				}
			} else if (e.keyCode === 39) { // right
				if (inputCell) {
					inputCell.textEditor.moveRight();
					e.preventDefault();
				}else if (specialCells.focused) {
					this.userInterestedByCell(specialCells.focused.row, specialCells.focused.col + 1);
					e.preventDefault();
				}
			} else if (e.keyCode === 38) { // up
				if (specialCells.focused.row > 0) {
					this.userInterestedByCell(specialCells.focused.row - 1, specialCells.focused.col);
					e.preventDefault();
				}
			} else if (e.keyCode === 40) { // down
				this.userInterestedByCell(specialCells.focused.row + 1, specialCells.focused.col);
				e.preventDefault();
			}
		}
		else if (eventType === 'keypress') {
			if (!inputCell && specialCells.focused) {
				if (this.activateCell(specialCells.focused.row, specialCells.focused.col, '')) {
					inputCell = specialCells.active;
				}
			}

			if (inputCell) {
				if (e.which !== 0) {
					var text = String.fromCharCode(e.which);
					inputCell.textEditor.insert(text);
				}
			}
		}
	};
}
