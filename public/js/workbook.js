(function(){
	var XWorkbook = function() {

		this.activateSheet = function(index) {
			var currentActive = $(this).find('div.spreadsheet.active');
			var nextActive = $(this).find('x-spreadsheet[data-index="' + index + '"] div.spreadsheet');
			currentActive.removeClass('active');
			nextActive.addClass('active');
			$(this).find('div.workbook-tabs td.active').removeClass('active');
			$(this).find('div.workbook-tabs td[data-index="' + index + '"]').addClass('active');
		};

		this.canFocus = function(cell) {
			return cell !== this._focusedCell;
		};

		this.focusCell = function(cell) {
			$('<span class="spacetaker">&nbsp;</span>').insertAfter($(cell));
			cell.editor.activate();
			$(cell).addClass('focused');
		};

		this.unFocusCell = function(cell) {
			$(cell).parent().find('span.spacetaker').remove();
			cell.editor.deactivate();
			$(cell).removeClass('focused');
		};

		this.cellClicked = function(event, cell) {
			if (event.button === 0) {
				if (this.canFocus(cell)) {
					if (this._focusedCell) {
						this.unFocusCell(this._focusedCell);
						this._focusedCell = null;
					}

					this.focusCell(cell);
					this._focusedCell = cell;
				}
			}
		};

		this.keydown = function(event) {
			if (this._focusedCell) {
				this._focusedCell.keydown(event);
			}
		};

		this.keypress = function(event) {
			if (this._focusedCell) {
				this._focusedCell.keypress(event);
			}
		};

		this.createdCallback = function() {

			this.setAttribute('tabindex', 1);

			this.addEventListener('keydown', this.keydown);
			this.addEventListener('keypress', this.keypress);

			var me = this;
			jxl.fetchWorkbook(this.getAttribute('name'), function(workbook) {
				me.workbook = workbook;
				me.workbook.setElement(me);
				render('tpl/workbook', {workbook: workbook}, me);
			});
		};

	};

	XWorkbook.prototype = Object.create(HTMLElement.prototype);

	document.registerElement('x-workbook', {prototype: new XWorkbook()});
})();
