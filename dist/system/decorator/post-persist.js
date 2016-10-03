'use strict';

System.register(['../persistent-config', '../util'], function (_export, _context) {
  "use strict";

  var PersistentConfig, Util;
  function PostPersist(optTarget, optPropertyKey, optDescriptor) {
    var isDecorator = Util.isPropertyDecorator.apply(Util, arguments);
    var deco = function deco(target, propertyKey, descriptor) {
      var postPersist = target[propertyKey];
      if (typeof postPersist !== 'function') {
        throw new Error('@PostPersist ' + propertyKey + ' is not a function');
      }
      var config = PersistentConfig.get(target);
      config.configure({ postPersist: postPersist });
      return Util.mergeDescriptors(descriptor, {
        configurable: true,
        enumerable: false,
        value: undefined,
        writable: false
      });
    };
    return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
  }

  _export('PostPersist', PostPersist);

  return {
    setters: [function (_persistentConfig) {
      PersistentConfig = _persistentConfig.PersistentConfig;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {}
  };
});