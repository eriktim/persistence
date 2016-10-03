'use strict';

System.register(['../persistent-object', '../util'], function (_export, _context) {
  "use strict";

  var PersistentObject, Util, collectibles;
  function isCollectible(entity) {
    var Target = Util.getClass(entity);
    return collectibles.has(Target);
  }

  _export('isCollectible', isCollectible);

  function Collectible(optTarget) {
    var isDecorator = Util.isClassDecorator.apply(Util, arguments);
    var deco = function deco(Target) {
      collectibles.add(Target);
      return PersistentObject.byDecoration(Target);
    };
    return isDecorator ? deco(optTarget) : deco;
  }

  _export('Collectible', Collectible);

  return {
    setters: [function (_persistentObject) {
      PersistentObject = _persistentObject.PersistentObject;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {
      collectibles = new WeakSet();
    }
  };
});