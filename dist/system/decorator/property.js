'use strict';

System.register(['../persistent-config', '../util'], function (_export, _context) {
  var PersistentConfig, Util;
  return {
    setters: [function (_persistentConfig) {
      PersistentConfig = _persistentConfig.PersistentConfig;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {
      function Property(pathOrTarget, optPropertyKey, optDescriptor) {
        var isDecorator = Util.isPropertyDecorator.apply(Util, arguments);
        var deco = function deco(target, propertyKey) {
          var path = isDecorator ? optPropertyKey : pathOrTarget || optPropertyKey;
          PersistentConfig.get(target).configureProperty(propertyKey, { path: path });
        };
        return isDecorator ? deco(pathOrTarget, optPropertyKey, optDescriptor) : deco;
      }

      _export('Property', Property);
    }
  };
});