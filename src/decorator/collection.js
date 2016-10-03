import {CollectionFactory} from '../collection';
import {PersistentConfig, PropertyType} from '../persistent-config';
import {Util} from '../util';
import {isCollectible} from './collectible';

const collectionsMap = new WeakMap();

function getCollectionFactory(Type, getter, setter) {
  return function(target, propertyKey) {
    if (!collectionsMap.has(target)) {
      collectionsMap.set(target, new Map());
    }
    const collections = collectionsMap.get(target);
    if (!collections.has(propertyKey)) {
      let data = Reflect.apply(getter, target, []);
      if (data === undefined) {
        data = [];
        Reflect.apply(setter, target, [data]);
      }
      if (!Array.isArray(data)) {
        throw new Error('collection data is corrupt');
      }
      let collection = CollectionFactory.create(Type, data, target);
      collections.set(propertyKey, collection);
    }
    return collections.get(propertyKey);
  };
}

export function Collection(Type) {
  if (Util.isPropertyDecorator(...arguments) || !Util.isClass(Type)) {
    throw new Error('@Collection requires a type');
  }
  if (!isCollectible(Type)) {
    throw new TypeError('@Collection type must be collectable');
  }
  return function(target, propertyKey, descriptor) {
    let config = PersistentConfig.get(target).getProperty(propertyKey);
    let getCollection = getCollectionFactory(
        Type, config.getter, config.setter);
    config.configure({
      type: PropertyType.COLLECTION,
      getter: function() {
        return getCollection(this, propertyKey);
      },
      setter: function() {
        throw new Error('cannot override collection');
      }
    });
  };
}
