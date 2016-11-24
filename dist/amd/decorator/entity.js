define(['exports', '../persistent-config', '../persistent-object', '../util'], function (exports, _persistentConfig, _persistentObject, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Entity = Entity;
  function Entity(optionsOrTarget) {
    var isDecorator = _util.Util.isClassDecorator.apply(_util.Util, arguments);
    var deco = function deco(Target) {
      var defaultPath = function defaultPath() {
        return Target.name.toLowerCase();
      };
      var path = void 0;
      var nonPersistent = false;
      if (isDecorator) {
        path = defaultPath();
      } else {
        var options = typeof optionsOrTarget === 'string' ? { path: optionsOrTarget } : optionsOrTarget || {};
        path = options.path || defaultPath();
        nonPersistent = options.nonPersistent || false;
      }
      var config = _persistentConfig.PersistentConfig.get(Target);
      config.configure({ path: path, nonPersistent: nonPersistent });
      return _persistentObject.PersistentObject.byDecoration(Target);
    };
    return isDecorator ? deco(optionsOrTarget) : deco;
  }
});