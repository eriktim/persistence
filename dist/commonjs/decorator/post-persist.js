'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PostPersist = PostPersist;

var _persistentConfig = require('../persistent-config');

var _util = require('../util');

function PostPersist(optTarget, optPropertyKey, optDescriptor) {
  var isDecorator = _util.Util.isPropertyDecorator.apply(_util.Util, arguments);
  var deco = function deco(target, propertyKey, descriptor) {
    var postPersist = target[propertyKey];
    if (typeof postPersist !== 'function') {
      throw new Error('@PostPersist ' + propertyKey + ' is not a function');
    }
    var config = _persistentConfig.PersistentConfig.get(target);
    config.configure({ postPersist: postPersist });
    return _util.Util.mergeDescriptors(descriptor, {
      configurable: true,
      enumerable: false,
      value: undefined,
      writable: false
    });
  };
  return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
}