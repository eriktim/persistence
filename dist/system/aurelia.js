'use strict';

System.register(['aurelia-binding', './config', './index'], function (_export, _context) {
  var computedFrom, Config, baseConfig;
  return {
    setters: [function (_aureliaBinding) {
      computedFrom = _aureliaBinding.computedFrom;
    }, function (_config) {
      Config = _config.Config;
    }, function (_index) {
      var _exportObj = {};

      for (var _key in _index) {
        if (_key !== "default") _exportObj[_key] = _index[_key];
      }

      _export(_exportObj);
    }],
    execute: function () {

      Config.setPropertyDecorator(computedFrom('__version__'));

      baseConfig = {
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
        var config = new Config();
        config.configure(baseConfig);
        if (typeof callback === 'function') {
          callback(config);
        }
      }

      _export('configure', configure);
    }
  };
});