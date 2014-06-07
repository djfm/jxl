var jxl;

(function(){
	function JXL() {
		var my = this;

		var workbooks = {};

		var defaultWorkbook = {
			name: 'default',
			worksheets: {
				0: {
					cells: {}
				},
				1: {
					cells: {}
				},
				2: {
					cells: {}
				}
			},
			worksheetsOrder: [0, 1, 2],
			activeWorksheet: 0
		};

		this.init = function() {
			$('div.workbook').each(function(i, div) {
				new Workbook(div);
			});
		};

		this.fetchWorkbook = function(name, cb) {
			if (name === 'default') {
				var workbook = new WorkbookModel(defaultWorkbook);
				workbooks[name] = workbook;
				cb(workbook);
			}
		};
	}
	jxl = new JXL();
}());

$(document).ready(function(){
	jxl.init();
});
