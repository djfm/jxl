(function() {
	// TEP: short for TextEditor Prototype
	var TEP = Object.create(HTMLElement.prototype);
	var activeEditor = null;

	TEP.createdCallback = function() {
		this.innerHTML = "&nbsp;";
	};

	TEP.keypress = function(e) {
		if (e.which !== 0) {
			var text = String.fromCharCode(e.which);
			this.insert(text);
		}
		else {
			console.log('not a char', e.keyCode);
		}
	};

	TEP.keydown = function(e) {
		if (this.isActive) {
			var me = $(this);

			if (e.keyCode === 8) { // backspace
				e.preventDefault();
				me.find('span.cursor').prev('span.char').remove();
			}
			else if (e.keyCode === 32) { // space
				this.insertChar('&nbsp;');
				e.preventDefault();
			}
			else if (e.keyCode === 37) { // left
				var cursor = me.find('span.cursor');
				cursor.insertBefore(cursor.prev('span.char'));
				e.preventDefault();
			}
			else if (e.keyCode === 39) { // right
				var cursor = me.find('span.cursor');
				cursor.insertBefore(cursor.next('span.char').next('span.char'));
				e.preventDefault();
			}
			else if (e.keyCode === 13) { // return
				if (this.onCommit) {
					this.onCommit();
				}
				e.preventDefault();
			}
			else {
				console.log("Keycode in editor:", e.keyCode);
			}
		}
	};

	TEP.insert = function(text) {
		for (var i = 0; i < text.length; i++) {
			this.insertChar(text[i]);
		}
	};

	TEP.insertChar = function(char) {
		this.activate();
		$('<span class="char">'+char+'</span>').insertBefore($(this).find('span.cursor'));
	};

	TEP.activate = function() {
		if (!this.isActive) {
			if (activeEditor) {
				activeEditor.deactivate();
			}
			var me = $(this);
			me.addClass('active');
			this.isActive = true;
			activeEditor = this;

			if (this.innerHTML === '&nbsp;') {
				this.innerHTML = '<span class="cursor">|</span>';
			}

			//me.css('position', 'absolute');
			me.find('span.cursor').show();
			me.append('<span class="virtual char">&nbsp;</span>');
			me.on('click.text-editor-internal', 'span.char', function(event) {
				me.find('span.cursor').insertBefore(event.target);
				event.stopPropagation();
			});
		}
	};

	TEP.deactivate = function() {
		var me = $(this);
		me.removeClass('active');
		me.find('span.cursor').hide();
		//me.css('position', 'static');
		this.isActive = false;
		me.off('click.text-editor-internal');
		me.find('span.virtual.char').remove();
	};

	document.registerElement(
		'text-editor',
		{prototype: TEP}
	);
})();
