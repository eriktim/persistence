'use strict';

System.register(['../entity-config', '../entity-data', '../util'], function (_export, _context) {
  var EntityConfig, EntityData, Util;
  return {
    setters: [function (_entityConfig) {
      EntityConfig = _entityConfig.EntityConfig;
    }, function (_entityData) {
      EntityData = _entityData.EntityData;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {
      function OneToOne(Type) {
        if (Util.isPropertyDecorator.apply(Util, arguments) || Util.is(Type) && !Util.isClass(Type)) {
          throw new Error('@OneToOne requires a constructor argument');
        }
        return function (target, propertyKey, descriptor) {
          if (!Type) {
            Type = target.constructor;
          }
          var getter = function getter() {
            var id = EntityData.getProperty(this, propertyKey);
            console.warn('TODO @OneToOne ' + id);
          };
          var setter = function setter(value) {
            if (!(value instanceof Type)) {
              throw new Error('invalid reference for \'' + propertyKey + '\':', value);
            }
            EntityData.setProperty(this, propertyKey, getId(value));
          };
          EntityConfig.get(target).configureProperty(propertyKey, { setter: setter, getter: getter });
        };
      }

      _export('OneToOne', OneToOne);
    }
  };
});