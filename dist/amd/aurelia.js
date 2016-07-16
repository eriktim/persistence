define(['exports', './index', 'aurelia-binding', './config'], function (exports, _index, _aureliaBinding, _config) {
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


  _config.Config.setPropertyDecorator((0, _aureliaBinding.computedFrom)('__version__'));

  var baseConfig = {
    extensible: false,
    onCreate: function onCreate(instance) {
      Reflect.defineProperty(instance, '__observers__', {
        enumerable: false,
        configurable: true,
        value: {},
        writable: true
      });
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