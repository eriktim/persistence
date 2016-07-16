'use strict';

System.register(['../entity-data', '../entity-config', '../util'], function (_export, _context) {
  var EntityData, EntityConfig, Util;
  return {
    setters: [function (_entityData) {
      EntityData = _entityData.EntityData;
    }, function (_entityConfig) {
      EntityConfig = _entityConfig.EntityConfig;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {
      function ElementCollection(Type) {
        if (Util.isPropertyDecorator.apply(Util, arguments) || !Util.isClass(Type)) {
          throw new Error('@ElementCollection requires a constructor argument');
        }
        return function (target, propertyKey, descriptor) {
          var getter = function getter() {};
          var setter = function setter(value) {
            throw new Error('cannot replace collection in \'' + propertyKey + '\'');
          };
          EntityConfig.get(target).configureProperty(propertyKey, { setter: setter, getter: getter });
        };
      }

      _export('ElementCollection', ElementCollection);
    }
  };
});