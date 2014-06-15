function CellModel(workbookName, worksheetId, row, col, data) {
	this.getValue = function() {
		return data.value;
	};

	this.setValue = function(value) {
		data.value = value;
		delete data.formula;
		return this;
	};

	this.setFormula = function(value) {
		var f = value.substring(1);
		data.formula = f;
		data.value = jxl.evaluate(workbookName, worksheetId, row, col, f);
	};

	this.getFormula = function() {
		return data.formula;
	};
}
