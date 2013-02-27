(function (WL) {

	self.port.on("wunderlist_click", function (postData) {

    WL.showOverlay(postData);
	});

})(window.WL);