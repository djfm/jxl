(function(){
	var XSpreadsheet = function() {
		this.createdCallback = function() {
			this._cells = {};
			this.workbook = jxl.getWorkbook(this.getAttribute('data-workbook-name'));
			this.index = parseInt(this.getAttribute('data-index'));
			this.spreadsheet = this.workbook.getSheet(this.index);
			this.spreadsheet.setElement(this);
			render('tpl/spreadsheet', {spreadsheet: this.spreadsheet}, this);
		};

		this.attachedCallback = function() {

		};

		this.updateSelectionRectangle = function() {
			if (!this._selectionRect) {
				this._selectionRect = $('<div class="selection-rectangle"></div>');
				$(this).find('div.spreadsheet').prepend(this._selectionRect);
			}

			this._selectionRect.css('left', Math.min(this._selStart.minx, this._selCurrent.minx));
			this._selectionRect.css('top', Math.min(this._selStart.miny, this._selCurrent.miny));
			this._selectionRect.css('width', Math.max(this._selStart.maxx, this._selCurrent.maxx) - Math.min(this._selStart.minx, this._selCurrent.minx));
			this._selectionRect.css('height', Math.max(this._selStart.maxy, this._selCurrent.maxy) - Math.min(this._selStart.miny, this._selCurrent.miny));
		};

		this.commitSelection = function() {
			this._selectionRect.remove();

			var trow = Math.min(this._selFrom.row, this._selTo.row);
			var brow = Math.max(this._selFrom.row, this._selTo.row);
			var lcol = Math.min(this._selFrom.col, this._selTo.col);
			var rcol = Math.max(this._selFrom.col, this._selTo.col);

			$(this).find('spreadsheet-cell.selected').removeClass('selected');
			for (var r = trow; r <= brow; r++) {
				for (var c = lcol; c <= rcol; c++) {
					$(this._cells[r][c]).addClass('selected');
				}
			}

			this._selFrom = this._selTo = this._selStart = this._selCurrent = null;
			this._selectionRect = null;
		};

		this.mousedown = function(event, cell) {
			if (event.button === 0 && !this._selStart && !$(cell).hasClass('focused')) {
				var r = this.getBoundingClientRect();
				var p = cell.getBoundingClientRect();

				this._selStart = this._selCurrent = {
					minx: p.left - r.left,
					maxx: p.left - r.left + p.width,
					miny: p.top - r.top,
					maxy: p.top - r.top + p.height
				};

				this._selFrom = this._selTo = cell;

				this.updateSelectionRectangle();
			}
			this.workbook.getElement().cellClicked(event, cell);
		};

		this.mouseover = function(event, cell) {
			if (this._selStart) {
				var r = this.getBoundingClientRect();
				var p = cell.getBoundingClientRect();

				this._selCurrent = {
					minx: p.left - r.left,
					maxx: p.left - r.left + p.width,
					miny: p.top - r.top,
					maxy: p.top - r.top + p.height
				};

				this._selTo = cell;

				this.updateSelectionRectangle();
			}
		};

		this.mouseup = function(event, cell) {
			if (this._selStart) {
				this.commitSelection();
			}
		};

		this.registerCell = function(cell) {
			if (!this._cells[cell.row]) {
				this._cells[cell.row] = {};
			}
			this._cells[cell.row][cell.col] = cell;
		};
	};

	XSpreadsheet.prototype = Object.create(HTMLElement.prototype);

	document.registerElement('x-spreadsheet', {prototype: new XSpreadsheet()});
})();
