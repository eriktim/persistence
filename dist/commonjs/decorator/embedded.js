'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Embedded = Embedded;

var _entityConfig = require('../entity-config');

var _util = require('../util');

function Embedded(Type) {
  var isDecorator = _util.Util.isPropertyDecorator.apply(_util.Util, arguments);
  return function (target, propertyKey, descriptor) {
    throw new Error('not yet implemented');
  };
}