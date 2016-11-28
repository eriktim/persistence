'use strict';

System.register(['../persistent-config', '../util'], function (_export, _context) {
  "use strict";

  var PersistentConfig, Util;
  function PreRemove(optTarget, optPropertyKey, optDescriptor) {
    var isDecorator = Util.isPropertyDecorator.apply(Util, arguments);
    var deco = function deco(target, propertyKey, descriptor) {
      var preRemove = target[propertyKey];
      if (typeof preRemove !== 'function') {
        throw new Error('@PreRemove ' + propertyKey + ' is not a function');
      }
      var config = PersistentConfig.get(target);
      config.configure({ preRemove: preRemove });
      return Util.mergeDescriptors(descriptor, {
        configurable: true,
        enumerable: false,
        value: undefined,
        writable: true
      });
    };
    return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
  }

  _export('PreRemove', PreRemove);

  return {
    setters: [function (_persistentConfig) {
      PersistentConfig = _persistentConfig.PersistentConfig;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {}
  };
});