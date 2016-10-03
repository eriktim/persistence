'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isEmbeddable = isEmbeddable;
exports.Embeddable = Embeddable;

var _persistentObject = require('../persistent-object');

var _util = require('../util');

var embeddables = new WeakSet();

function isEmbeddable(entity) {
  var Target = _util.Util.getClass(entity);
  return embeddables.has(Target);
}

function Embeddable(optTarget) {
  var isDecorator = _util.Util.isClassDecorator.apply(_util.Util, arguments);
  var deco = function deco(Target) {
    embeddables.add(Target);
    return _persistentObject.PersistentObject.byDecoration(Target);
  };
  return isDecorator ? deco(optTarget) : deco;
}