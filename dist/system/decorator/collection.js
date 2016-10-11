'use strict';

System.register(['../collection', '../persistent-config', '../util'], function (_export, _context) {
  var CollectionFactory, PersistentConfig, PropertyType, Util, collectionsMap;


  function getCollectionFactory(Type, getter, setter) {
    return function (target, propertyKey) {
      if (!collectionsMap.has(target)) {
        collectionsMap.set(target, new Map());
      }
      var collections = collectionsMap.get(target);
      if (!collections.has(propertyKey)) {
        var data = Reflect.apply(getter, target, []);
        if (data === undefined) {
          data = [];
          Reflect.apply(setter, target, [data]);
        }
        if (!Array.isArray(data)) {
          throw new Error('collection data is corrupt');
        }
        var collection = CollectionFactory.create(Type, data, target);
        collections.set(propertyKey, collection);
      }
      return collections.get(propertyKey);
    };
  }

  return {
    setters: [function (_collection) {
      CollectionFactory = _collection.CollectionFactory;
    }, function (_persistentConfig) {
      PersistentConfig = _persistentConfig.PersistentConfig;
      PropertyType = _persistentConfig.PropertyType;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {
      collectionsMap = new WeakMap();
      function Collection(Type) {
        if (Util.isPropertyDecorator.apply(Util, arguments) || !Util.isClass(Type)) {
          throw new Error('@Collection requires a type');
        }
        if (!Type.isCollectible) {
          throw new TypeError('@Collection type must be @Collectible');
        }
        return function (target, propertyKey, descriptor) {
          var config = PersistentConfig.get(target).getProperty(propertyKey);
          var getCollection = getCollectionFactory(Type, config.getter, config.setter);
          config.configure({
            type: PropertyType.COLLECTION,
            getter: function getter() {
              return getCollection(this, propertyKey);
            },
            setter: function setter() {
              throw new Error('cannot override collection');
            }
          });
        };
      }

      _export('Collection', Collection);
    }
  };
});