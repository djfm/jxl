/*function tag() {
	var contents = [];
	var tag_name_and_classes = (arguments[0] || 'div').split('.');
	var tag_name = tag_name_and_classes[0];
	var classes =  tag_name_and_classes.slice(1);

	var callback = null;
	for (var i = 1; i < arguments.length; i++) {
		if (typeof arguments[i] === 'function') {
			callback = arguments[i];
		}
	}
	if (callback) {
		callback(contents);
	}

	var classes_string = '';
	if (classes) {
		classes_string = ' class="' + classes.join(" ") + '"';
	}

	return '<' + tag_name + classes_string + '>' + contents.join('') + '</' + tag_name +'>';
}*/

function render(template, data, cb) {
	if (cb) {
		$.get(template + '.ejs').then(function(resp) {
			var html = new EJS({text: resp}).render(data);
			if (typeof cb === 'function') {
				cb(html);
			} else {
				cb.innerHTML = html;
			}
		});
	} else {
		return new EJS({url: template}).render(data);
	}
}
