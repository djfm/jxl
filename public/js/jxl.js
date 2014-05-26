(function() {
	function GridController() {
		var my = this;

		var selected = null;
		var focused = null;

		this.cellclick = function(cell, e) {
			if (cell === focused) {
				focused.unFocusCell();
				focused = null;
				selected = cell;
				selected.selectCell();
			}
			else if (focused !== null) {
				focused.unFocusCell();
				focused = null;
			}

			focused = cell;
			focused.focusCell();
		};

		this.keypress = function(event) {
			var target = selected || focused;
			if (target) {
				target.keypress(event);
			}
		};

		this.keydown = function(event) {
			var target = selected || focused;
			if (target) {
				target.keydown(event);
			}
		};
	}

	var controller = new GridController();

	// SCP: short for SpreadSheetCell Prototype
	var SCP = Object.create(HTMLElement.prototype);

	SCP.createdCallback = function() {
		this.innerHTML = "<div class='inner'><text-editor></text-editor>&nbsp;</div>";
		this.addEventListener('click', function(e) {
			controller.cellclick(this, e);
		});
		this.editor = this.getElementsByTagName('text-editor')[0];
	};

	SCP.focusCell = function() {
		$(this).addClass('focused');
	}

	SCP.unFocusCell = function() {
		$(this).removeClass('focused');
	};

	SCP.selectCell = function() {
		$(this).addClass('selected');
	};

	SCP.keypress = function(event) {
		this.editor.keypress(event);
	};

	SCP.keydown = function(event) {
		this.editor.keydown(event);
	};

	document.registerElement(
		'spreadsheet-cell',
		{prototype: SCP}
	);

	$(document).ready(function() {
		$(document).on('keypress', function(event) {
			controller.keypress(event);
		});
		$(document).on('keydown', function(event) {
			controller.keydown(event);
		});
	})
})();
