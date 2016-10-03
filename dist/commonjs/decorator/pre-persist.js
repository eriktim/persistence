'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PrePersist = PrePersist;

var _persistentConfig = require('../persistent-config');

var _util = require('../util');

function PrePersist(optTarget, optPropertyKey, optDescriptor) {
  var isDecorator = _util.Util.isPropertyDecorator.apply(_util.Util, arguments);
  var deco = function deco(target, propertyKey, descriptor) {
    var prePersist = target[propertyKey];
    if (typeof prePersist !== 'function') {
      throw new Error('@PrePersist ' + propertyKey + ' is not a function');
    }
    var config = _persistentConfig.PersistentConfig.get(target);
    config.configure({ prePersist: prePersist });
    return _util.Util.mergeDescriptors(descriptor, {
      configurable: true,
      enumerable: false,
      value: undefined,
      writable: false
    });
  };
  return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
}