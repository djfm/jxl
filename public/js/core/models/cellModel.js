function CellModel(data) {
	this.getValue = function() {
		return data.value;
	};

	this.setValue = function(value) {
		data.value = value;
		return this;
	};
}
