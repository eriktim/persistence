'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Collection = Collection;

var _collection = require('../collection');

var _persistentConfig = require('../persistent-config');

var _util = require('../util');

var _collectible = require('./collectible');

var collectionsMap = new WeakMap();

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
      var collection = _collection.CollectionFactory.create(Type, data, target);
      collections.set(propertyKey, collection);
    }
    return collections.get(propertyKey);
  };
}

function Collection(Type) {
  if (_util.Util.isPropertyDecorator.apply(_util.Util, arguments) || !_util.Util.isClass(Type)) {
    throw new Error('@Collection requires a type');
  }
  if (!(0, _collectible.isCollectible)(Type)) {
    throw new TypeError('@Collection type must be collectable');
  }
  return function (target, propertyKey, descriptor) {
    var config = _persistentConfig.PersistentConfig.get(target).getProperty(propertyKey);
    var getCollection = getCollectionFactory(Type, config.getter, config.setter);
    config.configure({
      type: _persistentConfig.PropertyType.COLLECTION,
      getter: function getter() {
        return getCollection(this, propertyKey);
      },
      setter: function setter() {
        throw new Error('cannot override collection');
      }
    });
  };
}