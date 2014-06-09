function WorkbookModel(data) {

	var worksheets = {};
	var locks = {};

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

	this.getWorksheet = function(id) {
		return worksheets[id];
	};

	this.getActiveWorksheet = function() {
		return worksheets[data.activeWorksheet];
	};

	this.owns = function(worksheetId, prop) {
		if (!locks.hasOwnProperty(prop)) {
			return true;
		} else {
			return locks[prop].by == worksheetId;
		}
	};

	this.lock = function(worksheetId, prop, value) {
		if (locks.hasOwnProperty(prop)) {
			if (locks[prop].by == worksheetId) {
				locks[prop].value = value;
				return true;
			} else {
				return false;
			}
		} else {
			locks[prop] = {
				by: worksheetId,
				value: value
			};
			return true;
		}
	};

	this.unlock = function(worksheetId, prop) {
		if (locks.hasOwnProperty(prop)) {
			if (locks[prop].by == worksheetId) {
				delete locks[prop];
				return true;
			} else {
				return false;
			}
		} else {
			return true;
		}
	};

	this.keyboardEvent = function(eventType, event) {
		if (!locks.hasOwnProperty('keyboard')) {
			this.getActiveWorksheet().keyboardEvent(eventType, event);
		} else {
			this.getWorksheet(locks.keyboard.by).keyboardEvent(eventType, event);
		}
	};

	this.getName = function() {
		return data.name;
	};
}
