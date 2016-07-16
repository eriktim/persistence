define(['exports', '../entity-config', '../util'], function (exports, _entityConfig, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.TemporalType = undefined;
  exports.Temporal = Temporal;
  var TemporalType = exports.TemporalType = Object.seal({
    DATETIME: 'YYYY-MM-DD HH:mm:ss',
    DATE: 'YYYY-MM-DD',
    TIME: 'HH:mm:ss'
  });

  function Temporal(typeOrTarget, optPropertyKey, optDescriptor) {
    var isDecorator = _util.Util.isPropertyDecorator.apply(_util.Util, arguments);
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
});