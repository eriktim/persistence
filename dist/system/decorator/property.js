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
      function Property(pathOrTarget, optPropertyKey, optDescriptor) {
        var isDecorator = Util.isPropertyDecorator.apply(Util, arguments);
        var deco = function deco(target, propertyKey, descriptor) {
          var path = isDecorator ? optPropertyKey : pathOrTarget || optPropertyKey;
          EntityConfig.get(target).configureProperty(propertyKey, { path: path });
        };
        return isDecorator ? deco(pathOrTarget, optPropertyKey, optDescriptor) : deco;
      }

      _export('Property', Property);
    }
  };
});