'use strict';

System.register(['../persistent-config', '../util'], function (_export, _context) {
  "use strict";

  var PersistentConfig, Util;
  function PostLoad(optTarget, optPropertyKey, optDescriptor) {
    var isDecorator = Util.isPropertyDecorator.apply(Util, arguments);
    var deco = function deco(target, propertyKey, descriptor) {
      var postLoad = target[propertyKey];
      if (typeof postLoad !== 'function') {
        throw new Error('@PostLoad ' + propertyKey + ' is not a function');
      }
      var config = PersistentConfig.get(target);
      config.configure({ postLoad: postLoad });
      return Util.mergeDescriptors(descriptor, {
        configurable: true,
        enumerable: false,
        value: undefined,
        writable: false
      });
    };
    return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
  }

  _export('PostLoad', PostLoad);

  return {
    setters: [function (_persistentConfig) {
      PersistentConfig = _persistentConfig.PersistentConfig;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {}
  };
});