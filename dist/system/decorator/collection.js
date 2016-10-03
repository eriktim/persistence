'use strict';

System.register(['../collection', '../persistent-config', '../util', './collectible'], function (_export, _context) {
  "use strict";

  var CollectionFactory, PersistentConfig, PropertyType, Util, isCollectible, collectionsMap;


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

  function Collection(Type) {
    if (Util.isPropertyDecorator.apply(Util, arguments) || !Util.isClass(Type)) {
      throw new Error('@Collection requires a type');
    }
    if (!isCollectible(Type)) {
      throw new TypeError('@Collection type must be collectable');
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

  return {
    setters: [function (_collection) {
      CollectionFactory = _collection.CollectionFactory;
    }, function (_persistentConfig) {
      PersistentConfig = _persistentConfig.PersistentConfig;
      PropertyType = _persistentConfig.PropertyType;
    }, function (_util) {
      Util = _util.Util;
    }, function (_collectible) {
      isCollectible = _collectible.isCollectible;
    }],
    execute: function () {
      collectionsMap = new WeakMap();
    }
  };
});