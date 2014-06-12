function CellTextEditor(element) {
	TextEditor.call(this, $(element).find('div.inner').get(0));

	this.canCompleteRange = function() {
		return true;
	};
}

CellTextEditor.prototype = Object.create(TextEditor);
