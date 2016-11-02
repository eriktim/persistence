'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Collectible = Collectible;

var _persistentObject = require('../persistent-object');

var _util = require('../util');

function Collectible(optTarget) {
  var isDecorator = _util.Util.isClassDecorator.apply(_util.Util, arguments);
  var deco = function deco(Target) {
    Target.isCollectible = true;
    return _persistentObject.PersistentObject.byDecoration(Target);
  };
  return isDecorator ? deco(optTarget) : deco;
}