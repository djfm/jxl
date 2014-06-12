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

		if (typeof parts === 'string') {
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

	this.activate = function(setActiveSelector) {
		active = true;
		this._previousContent = element.innerHTML;

		var html = element.innerHTML;
		if ($(html).find('span.virtual.char.cursor').length === 0) {
			html += '<span class="virtual char cursor">&nbsp;&nbsp;</span>';
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

	this.backspace = function() {
		$(element).find('span.cursor').prev('span.char').remove();
		this.changed();
	};

	this.moveLeft = function() {
		var cursor = $(element).find('span.cursor');
		cursor.removeClass('cursor');
		cursor.prev('span.char').addClass('cursor');
	};

	this.moveRight = function() {
		var cursor = $(element).find('span.cursor');
		cursor.removeClass('cursor');
		cursor.next('span.char').addClass('cursor');
	};
}
