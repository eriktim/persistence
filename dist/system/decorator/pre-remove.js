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
      function PreRemove(optTarget, optPropertyKey, optDescriptor) {
        var isDecorator = Util.isPropertyDecorator.apply(Util, arguments);
        var deco = function deco(target, propertyKey, descriptor) {
          var preRemove = target[propertyKey];
          if (typeof preRemove !== 'function') {
            throw new Error('@preRemove ' + propertyKey + ' is not a function');
          }
          var config = EntityConfig.get(target);
          config.configure({ preRemove: preRemove });
          return {
            configurable: true,
            enumerable: false,
            value: undefined,
            writable: false
          };
        };
        return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
      }

      _export('PreRemove', PreRemove);
    }
  };
});