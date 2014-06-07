function Workbook(workbookRoot) {
	var name = $(workbookRoot).attr('data-workbook-name') || "default";
	jxl.fetchWorkbook(name, function(workbook) {
		render('tpl/workbook', {workbook: workbook}, workbookRoot, function() {
			for(var i = 0; i < workbook.getSheetCount(); i++) {
				var id = workbook.getWorksheetIdByPosition(i);
				var sheetRoot = $(workbookRoot).find('[data-worksheet-id="' + id + '"]').get(0);
				var bigtable = new BigTable(sheetRoot);
			}
		});
	});
}
