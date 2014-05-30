function WorkbookModel(options) {

	options = options || {};

	var sheets = [];
	var activeSheetIndex;

	if (options.data) {
		this.load(options.data);
	} else {
		for (var i = 0; i < 3; i++) {
			sheets.push(new SpreadsheetModel({name: 'Sheet ' + i, index: i, workbook: this}));
		}
		activeSheetIndex = 0;
	}

	this.load = function(data) {

	};

	this.sheetCount = function() {
		return sheets.length;
	};

	this.getSheet = function(index_or_name) {
		for (var i = 0; i < sheets.length; i++) {
			if (typeof index_or_name === 'number') {
				if (sheets[i].getIndex() === index_or_name) {
					return sheets[i];
				}
			} else {
				if (sheets[i].getName() === index_or_name) {
					return sheets[i];
				}
			}
		}
		return null;
	};

	this.getSheetByPosition = function(position) {
		return sheets[position];
	};

	this.getActiveSheetIndex = function() {
		return activeSheetIndex;
	};
}
