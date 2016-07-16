'use strict';

System.register(['../entity-config', '../util'], function (_export, _context) {
  var EntityConfig, Util;
  return {
    setters: [function (_entityConfig) {
      EntityConfig = _entityConfig.EntityConfig;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {
      function PreLoad(optTarget, optPropertyKey, optDescriptor) {
        var isDecorator = Util.isPropertyDecorator.apply(Util, arguments);
        var deco = function deco(target, propertyKey, descriptor) {
          var preLoad = target[propertyKey];
          if (typeof preLoad !== 'function') {
            throw new Error('@preLoad ' + propertyKey + ' is not a function');
          }
          var config = EntityConfig.get(target);
          config.configure({ preLoad: preLoad });
          return {
            configurable: true,
            enumerable: false,
            value: undefined,
            writable: false
          };
        };
        return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
      }

      _export('PreLoad', PreLoad);
    }
  };
});