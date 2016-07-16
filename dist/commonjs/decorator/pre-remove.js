'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PreRemove = PreRemove;

var _entityConfig = require('../entity-config');

var _util = require('../util');

function PreRemove(optTarget, optPropertyKey, optDescriptor) {
  var isDecorator = _util.Util.isPropertyDecorator.apply(_util.Util, arguments);
  var deco = function deco(target, propertyKey, descriptor) {
    var preRemove = target[propertyKey];
    if (typeof preRemove !== 'function') {
      throw new Error('@preRemove ' + propertyKey + ' is not a function');
    }
    var config = _entityConfig.EntityConfig.get(target);
    config.configure({ preRemove: preRemove });
    return {
      configurable: true,
      enumerable: false,
      value: undefined,
      writable: false
    };
  };
  return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
}