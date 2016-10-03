define(['exports', '../persistent-config', '../util'], function (exports, _persistentConfig, _util) {
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
        throw new Error('@PostLoad ' + propertyKey + ' is not a function');
      }
      var config = _persistentConfig.PersistentConfig.get(target);
      config.configure({ postLoad: postLoad });
      return _util.Util.mergeDescriptors(descriptor, {
        configurable: true,
        enumerable: false,
        value: undefined,
        writable: false
      });
    };
    return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
  }
});