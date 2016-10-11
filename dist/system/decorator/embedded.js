'use strict';

System.register(['../persistent-config', '../persistent-object', '../util'], function (_export, _context) {
  var PersistentConfig, PropertyType, PersistentObject, Util, embeddedDataMap;


  function getEmbeddedDataFactory(Type, getter, setter) {
    return function (target, propertyKey) {
      if (!embeddedDataMap.has(target)) {
        embeddedDataMap.set(target, new Map());
      }
      var embeddedData = embeddedDataMap.get(target);
      if (!embeddedData.has(propertyKey)) {
        var data = Reflect.apply(getter, target, []);
        if (data === undefined) {
          data = {};
          Reflect.apply(setter, target, [data]);
        }
        if (!Util.isObject(data)) {
          throw new Error('embedded data is corrupt');
        }
        var type = new Type();
        PersistentObject.apply(type, data, target);
        embeddedData.set(propertyKey, type);
      }
      return embeddedData.get(propertyKey);
    };
  }

  return {
    setters: [function (_persistentConfig) {
      PersistentConfig = _persistentConfig.PersistentConfig;
      PropertyType = _persistentConfig.PropertyType;
    }, function (_persistentObject) {
      PersistentObject = _persistentObject.PersistentObject;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {
      embeddedDataMap = new WeakMap();
      function Embedded(Type) {
        var isDecorator = Util.isPropertyDecorator.apply(Util, arguments);
        if (isDecorator) {
          throw new Error('@Embedded requires a type');
        }
        if (!Type.isEmbeddable) {
          throw new TypeError('@Embedded type must be @Embeddable');
        }
        return function (target, propertyKey) {
          var config = PersistentConfig.get(target).getProperty(propertyKey);
          var getEmbeddedData = getEmbeddedDataFactory(Type, config.getter, config.setter);
          config.configure({
            type: PropertyType.EMBEDDED,
            getter: function getter() {
              return getEmbeddedData(this, propertyKey);
            },
            setter: function setter() {
              throw new Error('cannot override embedded object');
            }
          });
        };
      }

      _export('Embedded', Embedded);
    }
  };
});