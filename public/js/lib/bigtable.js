(function(){
	function BigTable(tableRoot) {

		var rowCount = 250000;
		var colCount = 64;
		var defaultRowHeight = 20;
		var defaultColWidth = 60;
		var colWidths = [];
		var gridContainer;
		var gridLeft;
		var specificRowHeightsChain;
		var specificRowHeights = {};
		var renderedRows = {};
		var renderedRowHandles = {};

		var my = this;

		this.getRowCount = function() {
			return rowCount;
		};

		this.getColCount = function() {
			return colCount;
		};

		this.getColWidth = function(col) {
			return colWidths[col];
		};

		var colNameMapping = {'0': 'A', '1': 'B', '2': 'C', '3': 'D', '4': 'E', '5': 'F', '6': 'G',
							  '7': 'H', '8': 'I', '9': 'J', 'a': 'K', 'b': 'L', 'c': 'M', 'd': 'N',
							  'e': 'O', 'f': 'P', 'g': 'Q', 'h': 'R', 'i': 'S', 'j': 'T', 'k': 'U',
							  'l': 'V', 'm': 'W', 'n': 'X', 'o': 'Y', 'p': 'Z'};

		this.getColName = function(n) {
			var str = n.toString(26);
			var res = "";
			for (var i = 0; i < str.length; i++) {
				res += colNameMapping[str[i]];
			}
			return res;
		};

		this.getDefaultRowHeight = function() {
			return defaultRowHeight;
		};

		this.getWidth= function() {
			return defaultColWidth * colCount;
		};

		this.getHeight = function() {
			return defaultRowHeight * rowCount;
		};

		this.getRowHeight = function(row) {
			return specificRowHeights.hasOwnProperty(row) ? specificRowHeights[row] : defaultRowHeight;
		};

		this.computeRowTopAndHeight = function(n) {

			if (typeof(n) !== "number") {
				n = parseInt(n);
			}

			var top = 0;
			var height = defaultRowHeight;
			var row = 0;

			var splitPoint = specificRowHeightsChain;
			while (splitPoint) {
				if (splitPoint.row > n) {
					break;
				} else {
					top += (splitPoint.row - row) * defaultRowHeight;
					row = splitPoint.row;

					if (splitPoint.row === n) {
						height = splitPoint.height;
					} else {
						top += splitPoint.height;
						row++;
					}

					splitPoint = splitPoint.next;
				}
			}

			top += (n - row) * defaultRowHeight;

			return [top, height];
		};

		this.changeRowHeight = function(row, newHeight) {

			var deltaHeight = newHeight - this.getRowHeight(row);

			specificRowHeights[row] = newHeight;

			if (!specificRowHeightsChain) {
				specificRowHeightsChain = {row: row, height: newHeight};
			}
			else {
				var splitPoint = specificRowHeightsChain;
				while (splitPoint.row < row && splitPoint.next) {
					splitPoint = splitPoint.next;
				}
				if (splitPoint.row === row) {
					splitPoint.height = newHeight;
				} else if (splitPoint.next) {
					var next = {row: splitPoint.row, height: splitPoint.height, next: splitPoint.next};
					splitPoint.row = row;
					splitPoint.height = newHeight;
					splitPoint.next = next;
				} else {
					splitPoint.next = {row: row, height: newHeight};
				}
			}

			renderedRows[row].css('height', newHeight);
			renderedRowHandles[row].css('height', newHeight);
			for (var i in renderedRows) {
				if (parseInt(i) > parseInt(row)) {
					var top = parseInt(renderedRows[i].css('top'), 10) + deltaHeight;
					renderedRows[i].css('top', top);
					renderedRowHandles[i].css('top', top);
				}
			}
		};

		this.changeColWidth = function(col, newWidth) {
			col = parseInt(col);
			colWidths[col] = newWidth;
			$(tableRoot).find('[data-col-number="' + col + '"]').css('width', newWidth);
		};

		this.computeRowNumberFromTop = function(h) {
			var top = 0;
			var row = 0;
			var splitPoint = specificRowHeightsChain;
			while (splitPoint) {

				var regularUpTo = top + (splitPoint.row - row) * defaultRowHeight;

				if (h < regularUpTo) {
					return Math.floor(row + (h-top) / defaultRowHeight);
				} else if (h < regularUpTo + splitPoint.height){
					return splitPoint.row;
				} else {
					row = splitPoint.row + 1;
					top = regularUpTo + splitPoint.height;
				}

				splitPoint = splitPoint.next;
			}
			return Math.floor(row + (h-top) / defaultRowHeight);
		};

		var renderRow = function(n, top, height) {
			renderedRows[n] = null;
			render('tpl/bigtable-row', {row: n, top: top, height: height, colWidths: colWidths}, function(rowHtml) {
				var row = $(rowHtml);
				renderedRows[n] = row;
				$(tableRoot).find('div.bigtable-cells').append(row);
			});
			var handle = $('<div class="bigtable-row-handle bigtable-fixed-width" data-row-number="' + n + '">' + n + '<div class="resizer">&nbsp;</div></div>');
			handle.css('top', top);
			handle.css('height', height);
			handle.appendTo($(tableRoot).find('div.bigtable-row-handles'));
			renderedRowHandles[n] = handle;
		};

		var updateLater;

		this.willUpdateDisplay = function() {
			if (updateLater) {
				window.clearTimeout(updateLater);
			}

			updateLater = window.setTimeout(function() {
				this.updateDisplay();
			}.bind(this), 100);
		};

		this.updateDisplay = function() {
			var container = $(tableRoot).find('div.bigtable-cells-container');

			var height = container.height();

			var extraBefore = 5;
			var firstRow = Math.max(this.computeRowNumberFromTop(container.scrollTop()) - extraBefore, 0);

			var h = 0;
			var row = firstRow;

			var dim = this.computeRowTopAndHeight(row);
			var top = dim[0];

			// bring new rows into view
			while (h < height*1.5 && row < rowCount) {
				var row_height = this.getRowHeight(row);
				if (!renderedRows.hasOwnProperty(row)) {
					renderRow(row, top, row_height);
				}
				top += row_height;
				h += row_height;
				row++;
			}
			// clean invisible rows
			for (var i in renderedRows) {
				i = parseInt(i);
				if (i < firstRow || i > row) {
					renderedRows[i].remove();
					renderedRowHandles[i].remove();
					delete renderedRows[i];
					delete renderedRowHandles[i];
				}
			}
		};

		this.scrollOnRowHandle = function(event) {
			var row = parseInt($(event.target).attr('data-row-number'));
			var newHeight = Math.max(defaultRowHeight, Math.round(renderedRows[row].height() * (1 + (event.originalEvent.wheelDelta > 0 ? 1 : -1) * 0.1)));
			this.changeRowHeight(row, newHeight);
			event.preventDefault();
		};

		this.scrollOnColHandle = function(event) {
			var newWidth = Math.round(parseInt($(event.target).css('width'), 10) * (1 + (event.originalEvent.wheelDelta > 0 ? 1 : -1) * 0.1));
			this.changeColWidth($(event.target).attr('data-col-number'), newWidth);
			event.preventDefault();
		};

		var rowResize = {};
		this.startRowResize = function(event) {
			rowResize = {};
			rowResize.start = event.pageY;
			rowResize.handle = $(event.target).closest('[data-row-number]');
			rowResize.number = parseInt(rowResize.handle.attr('data-row-number'));
			rowResize.lastHeight = rowResize.originalHeight = parseInt(renderedRows[rowResize.number].css('height'), 10);
			rowResize.handle.addClass('resizing');

			$('body').css('cursor', 'ns-resize');

			$(document).on('mousemove.resizing-row', function(e) {
				var newHeight = Math.max(defaultRowHeight, rowResize.originalHeight + e.pageY - rowResize.start);
				if (Math.abs(newHeight - rowResize.lastHeight) >= 1) {
					my.changeRowHeight(rowResize.number, newHeight);
					rowResize.lastHeight = newHeight;
				}
			});


			$(document).on('mouseup', function(e) {
				$(document).off('mousemove.resizing-row');
				rowResize.handle.removeClass('resizing');
				$('body').css('cursor', 'default');
				e.preventDefault();
			});

			event.preventDefault();
		};

		var colResize = {};
		this.startColResize = function(event) {
			colResize = {};
			colResize.start = event.pageX;
			colResize.handle = $(event.target).closest('[data-col-number]');
			colResize.number = parseInt(colResize.handle.attr('data-col-number'));
			colResize.lastWidth = colResize.originalWidth = parseInt(colResize.handle.css('width'), 10);
			colResize.handle.addClass('resizing');

			$('body').css('cursor', 'ew-resize');

			$(document).on('mousemove.resizing-col', function(e) {
				var newWidth = Math.max(defaultColWidth, colResize.originalWidth + e.pageX - colResize.start);
				if (Math.abs(newWidth - colResize.lastWidth) >= 1) {
					my.changeColWidth(colResize.number, newWidth);
					colResize.lastWidth = newWidth;
				}
			});


			$(document).on('mouseup', function(e) {
				$(document).off('mousemove.resizing-col');
				colResize.handle.removeClass('resizing');
				$('body').css('cursor', 'default');
				e.preventDefault();
			});

			event.preventDefault();
		};

		this.init = function() {
			this.willUpdateDisplay();
			gridContainer = $(tableRoot).find('div.bigtable-cells-container');
			gridLeft = gridContainer.scrollLeft();
			gridContainer.scroll(this.scroll.bind(this));
			$(tableRoot).on('mousewheel', '.bigtable-row-handle', this.scrollOnRowHandle.bind(this));
			$(tableRoot).on('mousewheel', '.bigtable-col-handle', this.scrollOnColHandle.bind(this));

			$(tableRoot).on('mousedown', '.bigtable-row-handle .resizer', this.startRowResize.bind(this));
			$(tableRoot).on('mousedown', '.bigtable-col-handle .resizer', this.startColResize.bind(this));
		};

		this.scroll = function(event) {
			if (gridContainer.scrollLeft() != gridLeft) {
				gridLeft = gridContainer.scrollLeft();
				$(tableRoot).find('div.bigtable-col-handles-container').scrollLeft(gridLeft);
			} else {
				$(tableRoot).find('div.bigtable-row-handles-container').scrollTop($(tableRoot).find('div.bigtable-cells-container').scrollTop());
				this.willUpdateDisplay(event);
			}
		};

		for (var i = 0; i < colCount; i++) {
			colWidths.push(defaultColWidth);
		}

		render('tpl/bigtable', {table: this}, tableRoot, this.init.bind(this));
	}

	$(document).ready(function() {
		$('div.bigtable').each(function(i, div) {
			new BigTable(div);
		});
	});
}());
