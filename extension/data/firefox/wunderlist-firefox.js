(function(WL) {

  var overlayId = 'wunderlist_overlay';

  function buildCss (options) {

    // Create styles for overlay
    var transitionSpeed = options && options.transitionSpeed || 500;
    var opacity = options && options.opacity || 0;

    return 'opacity:' + opacity + ';-webkit-transition:opacity ' + transitionSpeed + 'ms linear;';
  }

  function showOverlay (postData) {

    var existing = document.getElementById(overlayId);

    if (!existing) {

      var frame = document.createElement('iframe');

      frame.allowtransparency = 'true';
      frame.scrolling = 'no';
      frame.id = overlayId;
      frame.name = overlayId;
      frame.style.cssText = buildCss();
      frame.src = WL.buildUrl(postData);

      frame.onload = function () {

        frame.style.opacity = 1;

        setTimeout(function () {

          frame.style.cssText = buildCss({

            'opacity': 1,
            'transitionSpeed': 50
          });
        }, 1000);
      };

      document.body.appendChild(frame);

      var close = function close (ev) {

        if (ev.data === 'close_wunderlist') {

          frame.style.opacity = 0;

          setTimeout(function () {

            frame.src = 'about:blank';
            frame.onload = function () {

              window.removeEventListener('message', close, false);
              frame.parentNode.removeChild(frame);
              frame = null;
            };
          }, 500);
        }
      };

      window.addEventListener('message', close, false);
    }
  }

	self.port.on("wunderlist_click", function (postData) {

    postData.config = {

      'host': 'http://0.0.0.0:5000'
    };

    showOverlay(postData);

		// var temp = document.createElement('iframe');

		// temp.allowtransparency = 'true';
		// temp.scrolling = 'no';
		// temp.id = 'buffer_overlay';
		// temp.name = 'buffer_overlay';
		// temp.style.cssText = "border:none;height:100%;width:100%;position:fixed;z-index:99999999;top:0;left:0;opacity:0;display:block;-webkit-transition:opacity 500ms linear;"
		
		// var title = encodeURI(document.title || '');
		// var note = encodeURI(document.url || '');

		// if (!!postData.selection) {
		// 	note = encodeURI(postData.url + "\n" + postData.selection);
		// }

		// temp.src = 'http://0.0.0.0:5000/#/extension/add/' + title + '/' + note;

		// temp.onload = function () {
		// 	temp.style.opacity = 1;
		// };

		// document.body.appendChild(temp);
	});
})(window.WL);