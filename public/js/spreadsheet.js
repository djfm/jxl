(function(){
	var XSpreadsheet = function() {
		this.createdCallback = function() {

		};

		this.attachedCallback = function() {
			this.workbook = $(this).closest('x-workbook').get(0).workbook;
			this.index = parseInt(this.attributes.getNamedItem('data-index').value);
			this.spreadsheet = this.workbook.getSheet(this.index);
			render('tpl/spreadsheet', {spreadsheet: this.spreadsheet}, this);
		};

		var selStart, selCurrent, selFrom, selTo;
		var selectionRect;
		var cells = {};

		this.updateSelectionRectangle = function() {
			if (!selectionRect) {
				selectionRect = $('<div class="selection-rectangle"></div>');
				$(this).find('div.spreadsheet').prepend(selectionRect);
			}

			selectionRect.css('left', Math.min(selStart.minx, selCurrent.minx));
			selectionRect.css('top', Math.min(selStart.miny, selCurrent.miny));
			selectionRect.css('width', Math.max(selStart.maxx, selCurrent.maxx) - Math.min(selStart.minx, selCurrent.minx));
			selectionRect.css('height', Math.max(selStart.maxy, selCurrent.maxy) - Math.min(selStart.miny, selCurrent.miny) - 4);
		};

		this.commitSelection = function() {
			selectionRect.remove();

			var trow = Math.min(selFrom.row, selTo.row);
			var brow = Math.max(selFrom.row, selTo.row);
			var lcol = Math.min(selFrom.col, selTo.col);
			var rcol = Math.max(selFrom.col, selTo.col);

			$(this).find('spreadsheet-cell.selected').removeClass('selected');
			for (var r = trow; r <= brow; r++) {
				for (var c = lcol; c <= rcol; c++) {
					//cells[r][c].markSelected();
					$(this).find('spreadsheet-cell[data-row="' + r + '"][data-col="' + c + '"]').addClass('selected');
				}
			}

			selFrom = selTo = selStart = selCurrent = null;
			selectionRect = null;
		};

		this.mousedown = function(event, cell) {
			if (event.button === 0 && !selStart) {
				var r = $(this).find('div.spreadsheet').get(0).getBoundingClientRect();
				var p = cell.getBoundingClientRect();

				selStart = selCurrent = {
					minx: p.left - r.left,
					maxx: p.left - r.left + p.width,
					miny: p.top - r.top,
					maxy: p.top - r.top + p.height
				}
				selFrom = selTo = cell;

				this.updateSelectionRectangle();
			}
		};

		this.mouseover = function(event, cell) {
			if (selStart) {
				var r = $(this).find('div.spreadsheet').get(0).getBoundingClientRect();
				var p = cell.getBoundingClientRect();

				selCurrent = {
					minx: p.left - r.left,
					maxx: p.left - r.left + p.width,
					miny: p.top - r.top,
					maxy: p.top - r.top + p.height
				};

				selTo = cell;

				this.updateSelectionRectangle();
			}
		};

		this.mouseup = function(event, cell) {
			if (selStart) {
				this.commitSelection();
			}
		};

		this.registerCell = function(cell) {
			if (!cells[cell.row]) {
				cells[cell.row] = {};
			}
			cells[cell.row][cell.col] = cell;
		};
	};

	XSpreadsheet.prototype = Object.create(HTMLElement.prototype);

	document.registerElement('x-spreadsheet', {prototype: new XSpreadsheet()});
})();
