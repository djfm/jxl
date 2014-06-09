var jxl;

(function(){
	function JXL() {
		var my = this;

		var workbooks = {};

		this.init = function() {
			$('div.workbook').each(function(i, div) {
				new Workbook(div);
			});
		};

		this.fetchWorkbook = function(name, cb) {
			$.get('/workbooks/' + name + '/data', function(resp) {
					var workbook = new WorkbookModel(resp);
					workbooks[name] = workbook;
					cb(workbook);
			});
		};

		this.commit = function() {
			if (arguments[0] === 'cellValue') {
				var book = arguments[1];
				var sheet = arguments[2];
				var row = arguments[3];
				var col = arguments[4];
				var value = arguments[5];
				workbooks[book].getWorksheet(sheet).getCellModel(row, col).setValue(value);
			}
		};
	}
	jxl = new JXL();
}());

$(document).ready(function(){
	jxl.init();
});
