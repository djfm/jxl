function CellTextEditor(element) {
	TextEditor.call(this, $(element).find('div.inner').get(0));
}

CellTextEditor.prototype = Object.create(TextEditor);
