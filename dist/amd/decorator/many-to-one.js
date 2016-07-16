define(['exports', '../entity-config', '../util'], function (exports, _entityConfig, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ManyToOne = ManyToOne;
  function ManyToOne(TypeOrTarget, optPropertyKey, optDescriptor) {
    var isDecorator = _util.Util.isPropertyDecorator.apply(_util.Util, arguments);
    var deco = function deco(target, propertyKey, descriptor) {
      throw new Error('not yet implemented');
    };
    return isDecorator ? deco(TypeOrTarget, optPropertyKey, optDescriptor) : deco;
  }
});