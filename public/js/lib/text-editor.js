function TextEditor(element) {
	var activeSelector;

	this.clear = function() {
		element.innerHTML = '<span class="cursor">|</span><span class="virtual char">&nbsp;</span>';
	};

	this.init = function(text) {
		this.clear();
		if (text) {
			this.insert(text, true);
		}
	};

	this.changed = function() {
		if (this.onchange) {
			this.onchange(this);
		}
	};

	this.insert = function(text, dontEmitChange) {
		for (var i = 0; i < text.length; i++) {
			this.insertChar(text[i]);
		}
		if (!dontEmitChange) {
			this.changed();
		}
	};

	this.getText = function() {
		var chars = $(element).find('span.char');
		var text = '';
		for (var i = 0; i < chars.length; i++) {
			var c = $(chars[i]);
			if (!c.hasClass('virtual')) {
				text += c.text();
			}
		}
		return text;
	};

	this.insertChar = function(char) {
		$('<span class="char">'+char+'</span>').insertBefore($(element).find('span.cursor'));
	};

	this.activate = function(setActiveSelector) {
		this._previousContent = this.innerHTML;

		var $element = $(element);
		if (setActiveSelector) {
			activeSelector = setActiveSelector;
			$element.closest(setActiveSelector).addClass('active');
		} else {
			$element.addClass('active');
		}
		$element.on('click.text-editor-internal', 'span.char', function(event) {
			$element.find('span.cursor').insertBefore(event.target);
			event.stopPropagation();
		});
	};

	this.deactivate = function(restore) {
		if (restore) {
			element.innerHTML = this._previousContent;
		}
		if (activeSelector) {
			$(element).closest(activeSelector).removeClass('active');
			activeSelector = null;
		} else {
			$(element).removeClass('active');
		}
		$(element).off('click.text-editor-internal');
	};

	this.backspace = function() {
		$(element).find('span.cursor').prev('span.char').remove();
		this.changed();
	};

	this.moveLeft = function() {
		var cursor = $(element).find('span.cursor');
		cursor.insertBefore(cursor.prev('span.char'));
	};

	this.moveRight = function() {
		var cursor = $(element).find('span.cursor');
		cursor.insertBefore(cursor.next('span.char').next('span.char'));
	};
}
