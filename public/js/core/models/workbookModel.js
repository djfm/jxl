function WorkbookModel(data) {
	this.getSheetCount = function() {
		return data.worksheetsOrder.length;
	};

	this.getWorksheetIdByPosition = function(pos) {
		return data.worksheetsOrder[pos];
	};

	this.isWorksheetActive = function(id) {
		return data.activeWorksheet == id;
	};
}
