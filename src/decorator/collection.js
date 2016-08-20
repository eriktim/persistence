import {CollectionFactory} from '../collection';
import {EntityConfig} from '../entity-config';
import {EntityData} from '../entity-data';
import {Util} from '../util';

const collectionsMap = new WeakMap();

function getCollectionFactory(Type, path, getter) {
  return function(target, propertyKey) {
    if (!collectionsMap.has(target)) {
      collectionsMap.set(target, new Map());
    }
    const collections = collectionsMap.get(target);
    if (!collections.has(propertyKey)) {
      let data = Reflect.apply(getter, target, []) || [];
      if (!Array.isArray(data)) {
        throw new Error('collection data is corrupt');
      }
      let collection = CollectionFactory.create(Type, data);
      EntityData.setProperty(target, path, data);
      collections.set(propertyKey, collection);
    }
    return collections.get(propertyKey);
  };
}

export function Collection(Type) {
  if (Util.isPropertyDecorator(...arguments) || !Util.isClass(Type)) {
    throw new Error('@Collection requires a type');
  }
  return function(target, propertyKey, descriptor) {
    let config = EntityConfig.get(target).getProperty(propertyKey);
    let getCollection = getCollectionFactory(
        Type, config.fullPath, config.getter);
    config.configure({
      getter: function() {
        return getCollection(this, propertyKey);
      },
      setter: function() {
        throw new Error('cannot override collection');
      }
    });
  };
}
