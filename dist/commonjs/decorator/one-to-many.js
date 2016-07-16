'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.OneToMany = OneToMany;

var _entityConfig = require('../entity-config');

var _util = require('../util');

function OneToMany(TypeOrTarget, optPropertyKey, optDescriptor) {
  var isDecorator = _util.Util.isPropertyDecorator.apply(_util.Util, arguments);
  var deco = function deco(target, propertyKey, descriptor) {
    throw new Error('not yet implemented');
  };
  return isDecorator ? deco(TypeOrTarget, optPropertyKey, optDescriptor) : deco;
}