define(['exports', '../persistent-config', '../persistent-object', '../util'], function (exports, _persistentConfig, _persistentObject, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Entity = Entity;
  function Entity(pathOrTarget) {
    var isDecorator = _util.Util.isClassDecorator.apply(_util.Util, arguments);
    var deco = function deco(Target) {
      var defaultPath = Target.name.toLowerCase();
      var path = isDecorator ? defaultPath : pathOrTarget || defaultPath;
      var config = _persistentConfig.PersistentConfig.get(Target);
      config.configure({ path: path });
      return _persistentObject.PersistentObject.byDecoration(Target);
    };
    return isDecorator ? deco(pathOrTarget) : deco;
  }
});