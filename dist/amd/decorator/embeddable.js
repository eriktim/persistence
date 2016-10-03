define(['exports', '../persistent-object', '../util'], function (exports, _persistentObject, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.isEmbeddable = isEmbeddable;
  exports.Embeddable = Embeddable;


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
});