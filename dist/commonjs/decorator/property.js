'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Property = Property;

var _entityConfig = require('../entity-config');

var _util = require('../util');

function Property(pathOrTarget, optPropertyKey, optDescriptor) {
  var isDecorator = _util.Util.isPropertyDecorator.apply(_util.Util, arguments);
  var deco = function deco(target, propertyKey, descriptor) {
    var path = isDecorator ? optPropertyKey : pathOrTarget || optPropertyKey;
    _entityConfig.EntityConfig.get(target).configureProperty(propertyKey, { path: path });
  };
  return isDecorator ? deco(pathOrTarget, optPropertyKey, optDescriptor) : deco;
}