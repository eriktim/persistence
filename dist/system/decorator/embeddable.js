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
      function Embeddable(Target) {
        var isDecorator = Util.isClassDecorator.apply(Util, arguments);
        throw new Error('not yet implemented');
      }

      _export('Embeddable', Embeddable);
    }
  };
});