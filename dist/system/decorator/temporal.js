'use strict';

System.register(['../entity-config', '../util'], function (_export, _context) {
  var EntityConfig, Util, TemporalType;
  return {
    setters: [function (_entityConfig) {
      EntityConfig = _entityConfig.EntityConfig;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {
      _export('TemporalType', TemporalType = Object.seal({
        DATETIME: 'YYYY-MM-DD HH:mm:ss',
        DATE: 'YYYY-MM-DD',
        TIME: 'HH:mm:ss'
      }));

      _export('TemporalType', TemporalType);

      function Temporal(typeOrTarget, optPropertyKey, optDescriptor) {
        var isDecorator = Util.isPropertyDecorator.apply(Util, arguments);
        var type = TemporalType.DATETIME;
        if (!isDecorator) {
          type = typeOrTarget || TemporalType.DATETIME;
        }
        var deco = function deco(target, propertyKey, descriptor) {
          if (!Object.keys(TemporalType).map(function (key) {
            return TemporalType[key];
          }).find(function (t) {
            return t === type;
          })) {
            throw new Error('invalid type for @Temporal() ' + propertyKey);
          }
          throw new Error('not yet implemented');
        };
        return isDecorator ? deco(typeOrTarget, optPropertyKey, optDescriptor) : deco;
      }

      _export('Temporal', Temporal);
    }
  };
});