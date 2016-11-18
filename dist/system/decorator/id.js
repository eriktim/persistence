'use strict';

System.register(['../persistent-config', '../util'], function (_export, _context) {
  "use strict";

  var PersistentConfig, PropertyType, Util;
  function Id(optTarget, optPropertyKey, optDescriptor) {
    var isDecorator = Util.isPropertyDecorator.apply(Util, arguments);
    var deco = function deco(target, propertyKey) {
      var config = PersistentConfig.get(target);
      config.configure({
        idKey: propertyKey
      });
      config.configureProperty(propertyKey, { type: PropertyType.ID });
    };
    return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
  }

  _export('Id', Id);

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