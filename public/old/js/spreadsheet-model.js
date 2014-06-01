function SpreadsheetModel(options) {

	var workbook;
	var name;
	var index;
	var element;

	var cells = {};
	var rowCount = 64;
	var colCount = 64;

	if (options.data) {
		this.load(options.data);
	} else {
		name = options.name;
		index = options.index;
		workbook = options.workbook;
	}

	this.load = function(data) {

	};

	this.getName = function() {
		return name;
	};

	this.getIndex = function() {
		return index;
	};

	this.isActive = function() {
		return index === workbook.getActiveSheetIndex();
	};

	this.getRowCount = function() {
		return rowCount;
	};

	this.getColCount = function() {
		return colCount;
	};

	this.getWorkbookName = function() {
		return workbook.getName();
	};

	this.setElement = function(elem) {
		element = elem;
		return this;
	};

	this.getElement = function() {
		return element;
	};
}
