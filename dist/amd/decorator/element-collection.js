define(['exports', '../entity-data', '../entity-config', '../util'], function (exports, _entityData, _entityConfig, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ElementCollection = ElementCollection;
  function ElementCollection(Type) {
    if (_util.Util.isPropertyDecorator.apply(_util.Util, arguments) || !_util.Util.isClass(Type)) {
      throw new Error('@ElementCollection requires a constructor argument');
    }
    return function (target, propertyKey, descriptor) {
      var getter = function getter() {};
      var setter = function setter(value) {
        throw new Error('cannot replace collection in \'' + propertyKey + '\'');
      };
      _entityConfig.EntityConfig.get(target).configureProperty(propertyKey, { setter: setter, getter: getter });
    };
  }
});