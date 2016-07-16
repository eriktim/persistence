define(['exports', '../entity-config', '../entity-data', '../util'], function (exports, _entityConfig, _entityData, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.OneToOne = OneToOne;
  function OneToOne(Type) {
    if (_util.Util.isPropertyDecorator.apply(_util.Util, arguments) || _util.Util.is(Type) && !_util.Util.isClass(Type)) {
      throw new Error('@OneToOne requires a constructor argument');
    }
    return function (target, propertyKey, descriptor) {
      if (!Type) {
        Type = target.constructor;
      }
      var getter = function getter() {
        var id = _entityData.EntityData.getProperty(this, propertyKey);
        console.warn('TODO @OneToOne ' + id);
      };
      var setter = function setter(value) {
        if (!(value instanceof Type)) {
          throw new Error('invalid reference for \'' + propertyKey + '\':', value);
        }
        _entityData.EntityData.setProperty(this, propertyKey, getId(value));
      };
      _entityConfig.EntityConfig.get(target).configureProperty(propertyKey, { setter: setter, getter: getter });
    };
  }
});