function Workbook(workbookRoot) {
	var my = this;
	var name = $(workbookRoot).attr('data-workbook-name') || "default";
	this.model = null;

	jxl.fetchWorkbook(name, function(workbook) {
		my.model = workbook;
		render('tpl/workbook', {workbook: workbook}, workbookRoot, function() {
			for(var i = 0; i < workbook.getSheetCount(); i++) {
				var id = workbook.getWorksheetIdByPosition(i);
				var sheetRoot = $(workbookRoot).find('[data-worksheet-id="' + id + '"]').get(0);
				var bigtable = new BigTable(sheetRoot);
				workbook.setWorksheetTable(id, bigtable);
			}

			my.init();
		});
	});

	this.activateWorksheet = function(id) {
		$(workbookRoot).find('[data-active="true"]').attr('data-active', 'false');
		$(workbookRoot).find('[data-worksheet-id="' + id + '"]').attr('data-active', 'true');
		this.model.activateWorksheet(id);
	};

	this.init = function() {
		$(workbookRoot).on('click', 'div.worksheet-handle', function(e) {
			var id = parseInt($(e.target).attr('data-worksheet-id'));
			my.activateWorksheet(id);
		});
	};
}
