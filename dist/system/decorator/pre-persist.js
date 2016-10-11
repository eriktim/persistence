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
      function PrePersist(optTarget, optPropertyKey, optDescriptor) {
        var isDecorator = Util.isPropertyDecorator.apply(Util, arguments);
        var deco = function deco(target, propertyKey, descriptor) {
          var prePersist = target[propertyKey];
          if (typeof prePersist !== 'function') {
            throw new Error('@PrePersist ' + propertyKey + ' is not a function');
          }
          var config = PersistentConfig.get(target);
          config.configure({ prePersist: prePersist });
          return Util.mergeDescriptors(descriptor, {
            configurable: true,
            enumerable: false,
            value: undefined,
            writable: false
          });
        };
        return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
      }

      _export('PrePersist', PrePersist);
    }
  };
});