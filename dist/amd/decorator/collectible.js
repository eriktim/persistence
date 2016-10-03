define(['exports', '../persistent-object', '../util'], function (exports, _persistentObject, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.isCollectible = isCollectible;
  exports.Collectible = Collectible;


  var collectibles = new WeakSet();

  function isCollectible(entity) {
    var Target = _util.Util.getClass(entity);
    return collectibles.has(Target);
  }

  function Collectible(optTarget) {
    var isDecorator = _util.Util.isClassDecorator.apply(_util.Util, arguments);
    var deco = function deco(Target) {
      collectibles.add(Target);
      return _persistentObject.PersistentObject.byDecoration(Target);
    };
    return isDecorator ? deco(optTarget) : deco;
  }
});