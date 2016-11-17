'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Embeddable = Embeddable;

var _persistentObject = require('../persistent-object');

var _util = require('../util');

function Embeddable(optTarget) {
  var isDecorator = _util.Util.isClassDecorator.apply(_util.Util, arguments);
  var deco = function deco(Target) {
    Target.isEmbeddable = true;
    return _persistentObject.PersistentObject.byDecoration(Target, true);
  };
  return isDecorator ? deco(optTarget) : deco;
}