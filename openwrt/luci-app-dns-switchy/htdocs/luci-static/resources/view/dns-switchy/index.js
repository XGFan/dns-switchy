'use strict';
'require view';
'require uci';

return view.extend({
	handleSaveApply: null,
	handleSave: null,
	handleReset: null,

	load: function() {
		return uci.load('dns-switchy');
	},

	render: function() {
		var port = uci.get('dns-switchy', 'main', 'http_port') || '8080';
		var iframeSrc = '//' + window.location.hostname + ':' + port + '/';

		return E('div', { 'class': 'cbi-map' }, [
			E('iframe', {
				src: iframeSrc,
				style: 'width: 100%; height: calc(100vh - 120px); border: none; border-radius: 4px;',
				allowtransparency: 'true'
			})
		]);
	}
});
