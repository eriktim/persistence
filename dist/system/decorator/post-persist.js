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
      function PostPersist(optTarget, optPropertyKey, optDescriptor) {
        var isDecorator = Util.isPropertyDecorator.apply(Util, arguments);
        var deco = function deco(target, propertyKey, descriptor) {
          var postPersist = target[propertyKey];
          if (typeof postPersist !== 'function') {
            throw new Error('@postPersist ' + propertyKey + ' is not a function');
          }
          var config = EntityConfig.get(target);
          config.configure({ postPersist: postPersist });
          return {
            configurable: true,
            enumerable: false,
            value: undefined,
            writable: false
          };
        };
        return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
      }

      _export('PostPersist', PostPersist);
    }
  };
});