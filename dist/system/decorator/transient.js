'use strict';

System.register(['../persistent-config', '../util'], function (_export, _context) {
  "use strict";

  var PersistentConfig, PropertyType, Util;
  function Transient(optTarget, optPropertyKey, optDescriptor) {
    var isDecorator = Util.isPropertyDecorator.apply(Util, arguments);
    var deco = function deco(target, propertyKey) {
      PersistentConfig.get(target).configureProperty(propertyKey, {
        type: PropertyType.TRANSIENT
      });
    };
    return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
  }

  _export('Transient', Transient);

  return {
    setters: [function (_persistentConfig) {
      PersistentConfig = _persistentConfig.PersistentConfig;
      PropertyType = _persistentConfig.PropertyType;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {}
  };
});