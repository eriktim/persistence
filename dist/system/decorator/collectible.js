'use strict';

System.register(['../persistent-object', '../util'], function (_export, _context) {
  var PersistentObject, Util;
  return {
    setters: [function (_persistentObject) {
      PersistentObject = _persistentObject.PersistentObject;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {
      function Collectible(optTarget) {
        var isDecorator = Util.isClassDecorator.apply(Util, arguments);
        var deco = function deco(Target) {
          Target.isCollectible = true;
          return PersistentObject.byDecoration(Target);
        };
        return isDecorator ? deco(optTarget) : deco;
      }

      _export('Collectible', Collectible);
    }
  };
});