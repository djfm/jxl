(function(){

	function BigTable(tableRoot) {

		var rowCount = 1000000;
		var colCount = 256;
		var defaultRowHeight = 20;
		var defaultColWidth = 60;
		var colWidths = [];
		var my = this;

		this.getRowCount = function() {
			return rowCount;
		};

		this.getColCount = function() {
			return colCount;
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

		var specificRowHeights = {row: 10, height: 60, next: {row: 12, height: 100, next: null}};
		this.computeRowTopAndHeight = function(n) {
			var top = 0;
			var height = defaultRowHeight;
			var row = 0;

			var splitPoint = specificRowHeights;
			while (splitPoint !== null) {
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

		this.computeRowNumberFromTop = function(h) {
			var top = 0;
			var row = 0;
			var splitPoint = specificRowHeights;
			while (splitPoint !== null) {

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

		var renderedRows = {};

		var renderRow = function(n, top, height) {
			renderedRows[n] = null;
			render('tpl/bigtable-row', {row: n, colWidths: colWidths}, function(rowHtml) {
				var row = $(rowHtml);
				row.css('top', top);
				row.css('height', height);
				renderedRows[n] = row;
				$(tableRoot).find('div.bigtable-filler').append(row);
			});
		};

		var updateLater;

		this.willUpdateDisplay = function() {
			if (updateLater) {
				window.clearTimeout(updateLater);
			}

			updateLater = window.setTimeout(function() {
				this.updateDisplay();
			}.bind(this), 30);
		};

		this.updateDisplay = function() {
			console.log("updating diplay");
			var container = $(tableRoot).find('div.bigtable-container');

			var height = container.height();

			var extraBefore = 5;
			var firstRow = Math.max(this.computeRowNumberFromTop(container.scrollTop()) - extraBefore, 0);

			var h = 0;
			var row = firstRow;
			while (h < height*1.5) {
				var dim = this.computeRowTopAndHeight(row);
				if (!renderedRows.hasOwnProperty(row)) {
					renderRow(row, dim[0], dim[1]);
				}
				h += dim[1];
				row++;
			}
		};

		this.init = function() {
			for (var i = 0; i < colCount; i++) {
				colWidths.push(defaultColWidth);
			}
			this.willUpdateDisplay();
			$(tableRoot).find('div.bigtable-container').scroll(this.willUpdateDisplay.bind(this));
		};

		render('tpl/bigtable', {table: this}, tableRoot, this.init.bind(this));
	}

	$(document).ready(function() {
		$('div.bigtable').each(function(i, div) {
			new BigTable(div);
		});
	});
}());
