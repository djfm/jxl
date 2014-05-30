(function(){
	var XWorkbook = function() {
		this.createdCallback = function() {
			var me = this;
			jxl.getWorkbook('', function(workbook) {
				me.workbook = workbook;
				render('tpl/workbook', {workbook: workbook}, me);
			});
		};

		this.activateSheet = function(index) {
			//console.log($(this).find('div.spreadsheet.active'), $(this).find('x-spreadsheet[data-index="' + index + '"] div.spreadsheet'));
			var currentActive = $(this).find('div.spreadsheet.active');
			var nextActive = $(this).find('x-spreadsheet[data-index="' + index + '"] div.spreadsheet');
			currentActive.removeClass('active');
			nextActive.addClass('active');
			$(this).find('div.workbook-tabs td.active').removeClass('active');
			$(this).find('div.workbook-tabs td[data-index="' + index + '"]').addClass('active');
		};

	};

	XWorkbook.prototype = Object.create(HTMLElement.prototype);

	document.registerElement('x-workbook', {prototype: new XWorkbook()});
})();
