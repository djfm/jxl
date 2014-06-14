function CellModel(data) {
	this.getValue = function() {
		return data.value;
	};

	this.setValue = function(value) {
		data.value = value;
		return this;
	};

	this.setFormula = function(value) {
		var f = value.substring(1);
		data.formula = f;
		data.value = 'NIY';
	};

	this.getFormula = function() {
		return data.formula;
	};
}
