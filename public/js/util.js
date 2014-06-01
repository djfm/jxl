function render(template, data, cb, then) {
	if (cb) {
		$.get(template + '.ejs').then(function(resp) {
			var html = new EJS({text: resp}).render(data);
			if (typeof cb === 'function') {
				cb(html);
			} else {
				cb.innerHTML = html;
				if (then) {
					then();
				}
			}
		});
	} else {
		return new EJS({url: template}).render(data);
	}
}
