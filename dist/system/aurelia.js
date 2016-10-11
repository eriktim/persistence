'use strict';

System.register(['aurelia-binding', './config', './symbols', './index'], function (_export, _context) {
  var computedFrom, Config, VERSION, defineSymbol, baseConfig;
  return {
    setters: [function (_aureliaBinding) {
      computedFrom = _aureliaBinding.computedFrom;
    }, function (_config) {
      Config = _config.Config;
    }, function (_symbols) {
      VERSION = _symbols.VERSION;
      defineSymbol = _symbols.defineSymbol;
    }, function (_index) {
      var _exportObj = {};

      for (var _key in _index) {
        if (_key !== "default") _exportObj[_key] = _index[_key];
      }

      _export(_exportObj);
    }],
    execute: function () {

      Config.setPropertyDecorator(computedFrom(VERSION));

      baseConfig = {
        extensible: false,
        onNewObject: function onNewObject(object) {
          defineSymbol(object, '__observers__', {});
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