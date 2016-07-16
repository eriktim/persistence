define(['exports', '../entity-config', '../util'], function (exports, _entityConfig, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.PostLoad = PostLoad;
  function PostLoad(optTarget, optPropertyKey, optDescriptor) {
    var isDecorator = _util.Util.isPropertyDecorator.apply(_util.Util, arguments);
    var deco = function deco(target, propertyKey, descriptor) {
      var postLoad = target[propertyKey];
      if (typeof postLoad !== 'function') {
        throw new Error('@postLoad ' + propertyKey + ' is not a function');
      }
      var config = _entityConfig.EntityConfig.get(target);
      config.configure({ postLoad: postLoad });
      return {
        configurable: true,
        enumerable: false,
        value: undefined,
        writable: false
      };
    };
    return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
  }
});