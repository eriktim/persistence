'use strict';

System.register(['../persistent-config', '../persistent-object', '../util'], function (_export, _context) {
  "use strict";

  var PersistentConfig, PersistentObject, Util;
  function Entity(optionsOrTarget) {
    var isDecorator = Util.isClassDecorator.apply(Util, arguments);
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
      var config = PersistentConfig.get(Target);
      config.configure({
        path: path,
        cacheOnly: false,
        nonPersistent: nonPersistent
      });
      return PersistentObject.byDecoration(Target);
    };
    return isDecorator ? deco(optionsOrTarget) : deco;
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