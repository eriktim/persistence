define(['exports', '../entity-config', '../util'], function (exports, _entityConfig, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Embedded = Embedded;
  function Embedded(Type) {
    var isDecorator = _util.Util.isPropertyDecorator.apply(_util.Util, arguments);
    return function (target, propertyKey, descriptor) {
      throw new Error('not yet implemented');
    };
  }
});