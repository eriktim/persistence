'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PostRemove = PostRemove;

var _entityConfig = require('../entity-config');

var _util = require('../util');

function PostRemove(optTarget, optPropertyKey, optDescriptor) {
  var isDecorator = _util.Util.isPropertyDecorator.apply(_util.Util, arguments);
  var deco = function deco(target, propertyKey, descriptor) {
    var postRemove = target[propertyKey];
    if (typeof postRemove !== 'function') {
      throw new Error('@postRemove ' + propertyKey + ' is not a function');
    }
    var config = _entityConfig.EntityConfig.get(target);
    config.configure({ postRemove: postRemove });
    return {
      configurable: true,
      enumerable: false,
      value: undefined,
      writable: false
    };
  };
  return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
}