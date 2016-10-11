define(['exports', './index', 'aurelia-binding', './config', './symbols'], function (exports, _index, _aureliaBinding, _config, _symbols) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.keys(_index).forEach(function (key) {
    if (key === "default") return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return _index[key];
      }
    });
  });
  exports.configure = configure;


  _config.Config.setPropertyDecorator((0, _aureliaBinding.computedFrom)(_symbols.VERSION));

  var baseConfig = {
    extensible: false,
    onNewObject: function onNewObject(object) {
      (0, _symbols.defineSymbol)(object, '__observers__', {});
    }
  };

  function configure(aurelia, callback) {
    var config = new _config.Config();
    config.configure(baseConfig);
    if (typeof callback === 'function') {
      callback(config);
    }
  }
});