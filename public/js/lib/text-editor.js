function TextEditor(element) {
	var activeSelector;
	var active;

	this.clear = function() {
		element.innerHTML = '';
	};

	this.init = function(text) {
		element.innerHTML = this.highlight(text || '');
	};

	this.highlighter = function(text) {
		return text;
	};

	this.highlight = function(text) {

		var parts = this.highlighter(text);

		if (Object.prototype.toString.call(parts) !== '[object Array]') {
			parts = [parts];
		}

		var html = '';
		for(var i = 0; i < parts.length; i++) {
			var string;
			var klass;
			if (typeof parts[i] === 'string') {
				string = parts[i];
			} else {
				string = parts[i].string;
				klass = parts[i].klass;
			}
			if (klass) {
				html += '<span class="highlight ' + klass + '">';
			}

			for (var j = 0; j < string.length; j++) {
				html += '<span class="char">' + string[j] + '</span>';
			}

			if (klass) {
				html += '</span>';
			}
		}

		return html;
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

	this.insertCompletion = function(text) {
		console.log(text);
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

	this.activate = function(setActiveSelector, value) {
		active = true;
		this._previousContent = element.innerHTML;

		var html = value === undefined ? element.innerHTML : this.highlight(value);
		var root = '<div>' + html + '</div>';
		if ($(root).find('span.virtual.char.cursor').length === 0) {
			html = html + '<span class="virtual char cursor">&nbsp;&nbsp;</span>';
		}
		element.innerHTML = html;

		var $element = $(element);
		if (setActiveSelector) {
			activeSelector = setActiveSelector;
			$element.closest(setActiveSelector).addClass('active');
		} else {
			$element.addClass('active');
		}
		$element.on('click.text-editor-internal', 'span.char', function(event) {
			$element.find('span.cursor').removeClass('cursor');
			$(event.target).addClass('cursor');
			event.stopPropagation();
			event.preventDefault();
		});
	};

	this.restore = function() {
		element.innerHTML = this._previousContent;
	};

	this.deactivate = function(restore) {
		active = false;
		if (restore) {
			this.restore();
		} else {
			element.innerHTML = this.highlight(this.getText());
		}
		if (activeSelector) {
			$(element).closest(activeSelector).removeClass('active');
			activeSelector = null;
		} else {
			$(element).removeClass('active');
		}
		$(element).off('click.text-editor-internal');
	};

	this.isActive = function() {
		return active;
	};

	this.charBeforeCursor = function() {
		var cursor = $(element).find('span.cursor');
		var p = cursor.prev();

		if (p.length === 0) {
			p = cursor.closest('span.highlight').prev();
		}

		if (p.hasClass('char')) {
			return p;
		} else if (p.hasClass('highlight')) {
			var maybe = p.find('span.char:last');
			if (maybe.length === 1) {
				return maybe;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};

	this.charAfterCursor = function() {
		var cursor = $(element).find('span.cursor');
		var p = cursor.next();

		if (p.length === 0) {
			p = cursor.closest('span.highlight').next();
		}

		if (p.hasClass('char')) {
			return p;
		} else if (p.hasClass('highlight')) {
			var maybe = p.find('span.char:first');
			if (maybe.length === 1) {
				return maybe;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};

	this.backspace = function() {
		$(element).find('span.cursor').prev('span.char').remove();
		this.changed();
	};

	this.moveLeft = function() {
		var c = this.charBeforeCursor();
		if (c) {
			$(element).find('span.cursor').removeClass('cursor');
			c.addClass('cursor');
		}
	};

	this.moveRight = function() {
		var c = this.charAfterCursor();
		if (c) {
			$(element).find('span.cursor').removeClass('cursor');
			c.addClass('cursor');
		}
	};
}
