'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PreLoad = PreLoad;

var _entityConfig = require('../entity-config');

var _util = require('../util');

function PreLoad(optTarget, optPropertyKey, optDescriptor) {
  var isDecorator = _util.Util.isPropertyDecorator.apply(_util.Util, arguments);
  var deco = function deco(target, propertyKey, descriptor) {
    var preLoad = target[propertyKey];
    if (typeof preLoad !== 'function') {
      throw new Error('@preLoad ' + propertyKey + ' is not a function');
    }
    var config = _entityConfig.EntityConfig.get(target);
    config.configure({ preLoad: preLoad });
    return {
      configurable: true,
      enumerable: false,
      value: undefined,
      writable: false
    };
  };
  return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
}