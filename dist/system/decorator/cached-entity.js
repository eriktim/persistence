'use strict';

System.register(['../persistent-config', '../util'], function (_export, _context) {
  "use strict";

  var PersistentConfig, Util;
  function CachedEntity(pathOrTarget) {
    var isDecorator = Util.isClassDecorator.apply(Util, arguments);
    var deco = function deco(Target) {
      var defaultPath = function defaultPath() {
        return Target.name.toLowerCase();
      };
      var path = isDecorator ? defaultPath() : pathOrTarget || defaultPath();
      var config = PersistentConfig.get(Target);
      config.configure({
        path: path,
        cacheOnly: true,
        nonPersistent: true
      });
    };
    return isDecorator ? deco(pathOrTarget) : deco;
  }

  _export('CachedEntity', CachedEntity);

  return {
    setters: [function (_persistentConfig) {
      PersistentConfig = _persistentConfig.PersistentConfig;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {}
  };
});