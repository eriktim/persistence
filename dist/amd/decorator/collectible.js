define(['exports', '../persistent-object', '../util'], function (exports, _persistentObject, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Collectible = Collectible;
  function Collectible(optTarget) {
    var isDecorator = _util.Util.isClassDecorator.apply(_util.Util, arguments);
    var deco = function deco(Target) {
      Target.isCollectible = true;
      if (!Target.isPersistent) {
        return _persistentObject.PersistentObject.byDecoration(Target);
      }
    };
    return isDecorator ? deco(optTarget) : deco;
  }
});