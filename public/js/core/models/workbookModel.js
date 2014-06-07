function WorkbookModel(data) {

	var worksheets = {};

	for (var i in data.worksheets) {
		worksheets[i] = new WorksheetModel(data.worksheets[i]);
	}

	this.getSheetCount = function() {
		return data.worksheetsOrder.length;
	};

	this.getWorksheetIdByPosition = function(pos) {
		return data.worksheetsOrder[pos];
	};

	this.isWorksheetActive = function(id) {
		return data.activeWorksheet == id;
	};

	this.activateWorksheet = function(id) {
		data.activeWorksheet = id;
		worksheets[id].activate();
	};

	this.setWorksheetTable = function(id, table) {
		worksheets[id].setTable(table);
	};
}
