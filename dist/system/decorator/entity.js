'use strict';

System.register(['../persistent-config', '../persistent-object', '../util'], function (_export, _context) {
  "use strict";

  var PersistentConfig, PersistentObject, Util;
  function Entity(pathOrTarget) {
    var isDecorator = Util.isClassDecorator.apply(Util, arguments);
    var deco = function deco(Target) {
      var defaultPath = Target.name.toLowerCase();
      var path = isDecorator ? defaultPath : pathOrTarget || defaultPath;
      var config = PersistentConfig.get(Target);
      config.configure({ path: path });
      return PersistentObject.byDecoration(Target);
    };
    return isDecorator ? deco(pathOrTarget) : deco;
  }

  _export('Entity', Entity);

  return {
    setters: [function (_persistentConfig) {
      PersistentConfig = _persistentConfig.PersistentConfig;
    }, function (_persistentObject) {
      PersistentObject = _persistentObject.PersistentObject;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {}
  };
});