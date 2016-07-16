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
      function Id(optTarget, optPropertyKey, optDescriptor) {
        var isDecorator = Util.isPropertyDecorator.apply(Util, arguments);
        var deco = function deco(target, propertyKey, descriptor) {
          EntityConfig.get(target).configure({ idKey: propertyKey });
        };
        return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
      }

      _export('Id', Id);
    }
  };
});