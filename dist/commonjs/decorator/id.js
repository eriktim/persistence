'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Id = Id;

var _persistentConfig = require('../persistent-config');

var _util = require('../util');

function Id(optTarget, optPropertyKey, optDescriptor) {
  var isDecorator = _util.Util.isPropertyDecorator.apply(_util.Util, arguments);
  var deco = function deco(target, propertyKey) {
    _persistentConfig.PersistentConfig.get(target).configure({
      idKey: propertyKey
    });
  };
  return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
}