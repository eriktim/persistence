define(['exports', '../persistent-config', '../util'], function (exports, _persistentConfig, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Id = Id;
  function Id(optTarget, optPropertyKey, optDescriptor) {
    var isDecorator = _util.Util.isPropertyDecorator.apply(_util.Util, arguments);
    var deco = function deco(target, propertyKey) {
      var config = _persistentConfig.PersistentConfig.get(target);
      config.configure({
        idKey: propertyKey
      });
      config.configureProperty(propertyKey, { type: _persistentConfig.PropertyType.ID });
    };
    return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
  }
});