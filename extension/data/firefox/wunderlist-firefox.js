(function() {
	self.port.on("wunderlist_click", function(postData) {
		var temp = document.createElement('iframe');

		temp.allowtransparency = 'true';
		temp.scrolling = 'no';
		temp.id = 'buffer_overlay';
		temp.name = 'buffer_overlay';
		temp.style.cssText = "border:none;height:100%;width:100%;position:fixed;z-index:99999999;top:0;left:0;opacity:0;display:block;-webkit-transition:opacity 500ms linear;"
		
		var title = encodeURI(document.title || '');
		var note = encodeURI(document.url || '');

		if (!!postData.selection) {
			note = encodeURI(postData.url + "\n" + postData.selection);
		}

		temp.src = 'http://0.0.0.0:5000/#/extension/add/' + title + '/' + note;

		temp.onload = function () {
			temp.style.opacity = 1;
		}

		document.body.appendChild(temp);
	});
}());