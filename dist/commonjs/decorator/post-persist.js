'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PostPersist = PostPersist;

var _entityConfig = require('../entity-config');

var _util = require('../util');

function PostPersist(optTarget, optPropertyKey, optDescriptor) {
  var isDecorator = _util.Util.isPropertyDecorator.apply(_util.Util, arguments);
  var deco = function deco(target, propertyKey, descriptor) {
    var postPersist = target[propertyKey];
    if (typeof postPersist !== 'function') {
      throw new Error('@postPersist ' + propertyKey + ' is not a function');
    }
    var config = _entityConfig.EntityConfig.get(target);
    config.configure({ postPersist: postPersist });
    return {
      configurable: true,
      enumerable: false,
      value: undefined,
      writable: false
    };
  };
  return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
}