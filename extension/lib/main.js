// Plugin APIs
var widgets     = require("widget");
var tabs        = require("tabs");
var self        = require("self");
var pageMod     = require("page-mod");
var selection   = require("selection");
var ss          = require("simple-storage");
var simplePrefs = require("simple-prefs");
var cm          = require("context-menu");
var { Cc, Ci }  = require('chrome');
var mediator    = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);

// Configuration
var config = {};
config.plugin = {

    'label': 'Add to Wunderlist',

    'icon': {

      'static': self.data.url('common/icons/AddToWLPictogram16.png')
    },

    'version': self.version,

    'menu': {

      'page': {

        'label': "Add to Wunderlist",
        'scripts': [self.data.url('firefox/menu/wunderlist-page.js')]
      },

      'selection': {

        'label': "Add to Wunderlist"
      }
    },

    'injected': {

      'scripts': [

        self.data.url('common/libs/jquery.min.js'),

        self.data.url('common/WL.js'),
        self.data.url('common/Overlay.js'),
        self.data.url('common/Scrapers.js'),
        self.data.url('common/Injectors.js'),

        self.data.url('firefox/wunderlist-firefox.js')
      ]
    },

    'overlay': {

      'scripts': [

        self.data.url('common/libs/jquery.min.js'),

        self.data.url('common/WL.js'),
        self.data.url('common/Overlay.js'),
        self.data.url('common/Scrapers.js'),
        self.data.url('common/Injectors.js'),

        self.data.url('firefox/wunderlist-firefox-port-wrapper.js'),
        self.data.url('firefox/wunderlist-firefox-data-wrapper.js'),
        self.data.url('firefox/wunderlist-firefox.js')
      ]
    }
};

// Injectors
var pageMod = require('page-mod').PageMod({

  'include': '*',
  'contentScriptFile': config.plugin.injected.scripts,
  'contentStyleFile': require('self').data.url('common/css/styles.css')
});

// Overlay
var attachOverlay = function (data, cb) {
    
    if (typeof data === 'function') {

      cb = data;
    }

    if (!data) {

      data = {};
    }

    if (!cb) {

      cb = function () {};
    }

    if (!data.embed) {
      
      data.embed = {};
    }

    var worker = tabs.activeTab.attach({

      'contentScriptFile': config.plugin.overlay.scripts
    });
    
    // worker.port.on('wunderlist_done', function (overlayData) {

    //     worker.destroy();
    //     cb(overlayData);
    // });

    // Pass statistic data
    // data.version = config.plugin.version;
    // if( data.embed.placement ) data.placement = data.embed.placement;

    // Inform overlay that click has occurred
    worker.port.emit("wunderlist_click", data);
};

// Remember this page
var button = widgets.Widget({

  'id': 'wunderlist-button',
  'label': config.plugin.label,
  'contentURL': config.plugin.icon['static']
});

button.on('click', function () {

  attachOverlay({placement: 'toolbar'}, function () {

    button.contentURL = config.plugin.icon['static'];
  });
});

// Context menu
var menu = {};

menu.page = cm.Item({

  'label': config.plugin.menu.page.label,
  'image': config.plugin.icon['static'],
  'context': cm.PageContext(),
  'contentScriptFile': config.plugin.menu.page.scripts,
  'contentScriptWhen': 'start',
  'onMessage': function (data) {

    if (data == 'wunderlist_click') {

      attachOverlay({placement: 'menu-page'});
    }
  }
});

menu.selection = cm.Item({

  'label': config.plugin.menu.selection.label,
  'image': config.plugin.icon['static'],
  'context': cm.SelectionContext(),
  'contentScriptFile': config.plugin.menu.page.scripts,
  'contentScriptWhen': 'start',
  'onMessage': function (data) {
    
    if (data == 'wunderlist_click') {

      attachOverlay({placement: 'menu-selection'});
    }
  }
});

var addNavBarButton = function (browserWindow) {

  var document = browserWindow.document;
  var navBar = document.getElementById('nav-bar');

  if (!navBar) {

      return;
  }

  var btn = document.createElement('toolbarbutton');
  btn.setAttribute('id', 'wunderlist-button');
  btn.setAttribute('type', 'button');
  // the toolbarbutton-1 class makes it look like a traditional button
  btn.setAttribute('class', 'toolbarbutton-1');
  btn.setAttribute('width', 'auto');
  btn.setAttribute('image', config.plugin.icon['static']);
  // this text will be shown when the toolbar is set to text or text and icons
  btn.setAttribute('label', config.plugin.label);
  btn.addEventListener('click', function() {
      // Go go go
      attachOverlay({placement: 'toolbar'});
  }, false);
  
  navBar.appendChild(btn);
};

var removeNavBarButton = function (browserWindow) {

  var document = browserWindow.document;
  var navBar = document.getElementById('nav-bar');
  var btn = document.getElementById('wunderlist-button');
 
  if (navBar && btn) {

    navBar.removeChild(btn);
  }
};

// Navigation bar icon
// exports.main is called when extension is installed or re-enabled
exports.main = function (options, callbacks) {

  // for the current window
  var browserWindow = mediator.getMostRecentWindow('navigator:browser');
  addNavBarButton(browserWindow);

  // handle new windows
  var windowListener = {

    'onOpenWindow': function (aWindow) {

      // Wait for the window to finish loading
      var domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
      addNavBarButton(domWindow);
      domWindow.addEventListener("load", function () {

        domWindow.removeEventListener("load", arguments.callee, false);
        addNavBarButton(domWindow);
      }, false);
    },

    'onCloseWindow': function (aWindow) {

      removeNavBarButton(aWindow);
    },

    'onWindowTitleChange': function (aWindow, aTitle) {}
  };
  
  mediator.addListener(windowListener);
};