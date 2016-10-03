'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Transient = Transient;

var _persistentConfig = require('../persistent-config');

var _util = require('../util');

function Transient(optTarget, optPropertyKey, optDescriptor) {
  var isDecorator = _util.Util.isPropertyDecorator.apply(_util.Util, arguments);
  var deco = function deco(target, propertyKey) {
    _persistentConfig.PersistentConfig.get(target).configureProperty(propertyKey, {
      type: _persistentConfig.PropertyType.TRANSIENT
    });
  };
  return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
}