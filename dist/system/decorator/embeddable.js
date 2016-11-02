'use strict';

System.register(['../persistent-object', '../util'], function (_export, _context) {
  "use strict";

  var PersistentObject, Util;
  function Embeddable(optTarget) {
    var isDecorator = Util.isClassDecorator.apply(Util, arguments);
    var deco = function deco(Target) {
      Target.isEmbeddable = true;
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
    execute: function () {}
  };
});