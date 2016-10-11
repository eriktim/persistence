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
      function Id(optTarget, optPropertyKey, optDescriptor) {
        var isDecorator = Util.isPropertyDecorator.apply(Util, arguments);
        var deco = function deco(target, propertyKey) {
          PersistentConfig.get(target).configure({
            idKey: propertyKey
          });
        };
        return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
      }

      _export('Id', Id);
    }
  };
});