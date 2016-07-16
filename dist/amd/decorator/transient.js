define(['exports', '../entity-config', '../util'], function (exports, _entityConfig, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Transient = Transient;
  function Transient(optTarget, optPropertyKey, optDescriptor) {
    var isDecorator = _util.Util.isPropertyDecorator.apply(_util.Util, arguments);
    var deco = function deco(target, propertyKey, descriptor) {
      _entityConfig.EntityConfig.get(target).configureProperty(propertyKey, { transient: true });
    };
    return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
  }
});