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
      function Embedded(Type) {
        var isDecorator = Util.isPropertyDecorator.apply(Util, arguments);
        return function (target, propertyKey, descriptor) {
          throw new Error('not yet implemented');
        };
      }

      _export('Embedded', Embedded);
    }
  };
});