var render = (function(){

	var cache = {};

	return function(template, data, cb, then) {

		function handleTemplate(resp) {
			var html = new EJS({text: resp}).render(data);
			if (typeof cb === 'function') {
				cb(html);
			} else {
				cb.innerHTML = html;
				if (then) {
					then();
				}
			}
		}

		if (cb) {
			if (cache[template]) {
				handleTemplate(cache[template]);
			} else {
				$.get(template + '.ejs').then(function(resp) {
					cache[template] = resp;
					handleTemplate(resp);
				});
			}
		} else {
			return new EJS({url: template}).render(data);
		}
	};
}());
