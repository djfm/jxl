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
				workbook.getWorksheet(id)
				.setTable(bigtable)
				.setWorkbookModel(workbook)
				.setWorksheetId(id);
			}

			my.init();
		});
	});

	this.activateWorksheet = function(id) {
		$(workbookRoot).find('[data-active="true"]').attr('data-active', 'false');
		$(workbookRoot).find('[data-worksheet-id="' + id + '"]').attr('data-active', 'true');
		this.model.activateWorksheet(id);
	};

	this.keydown = function(event) {
		this.model.keyboardEvent('keydown', event);
	};

	this.keypress = function(event) {
		this.model.keyboardEvent('keypress', event);
	};

	this.init = function() {
		$(workbookRoot).attr('tabindex', 1);

		$(workbookRoot).on('click', 'div.worksheet-handle', function(e) {
			var id = parseInt($(e.target).attr('data-worksheet-id'));
			my.activateWorksheet(id);
		});

		$(workbookRoot).on('keydown', this.keydown.bind(this));
		$(workbookRoot).on('keypress', this.keypress.bind(this));
	};
}
