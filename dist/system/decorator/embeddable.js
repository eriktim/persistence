'use strict';

System.register(['../persistent-object', '../util'], function (_export, _context) {
  "use strict";

  var PersistentObject, Util, embeddables;
  function isEmbeddable(entity) {
    var Target = Util.getClass(entity);
    return embeddables.has(Target);
  }

  _export('isEmbeddable', isEmbeddable);

  function Embeddable(optTarget) {
    var isDecorator = Util.isClassDecorator.apply(Util, arguments);
    var deco = function deco(Target) {
      embeddables.add(Target);
      return PersistentObject.byDecoration(Target);
    };
    return isDecorator ? deco(optTarget) : deco;
  }

  _export('Embeddable', Embeddable);

  return {
    setters: [function (_persistentObject) {
      PersistentObject = _persistentObject.PersistentObject;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {
      embeddables = new WeakSet();
    }
  };
});