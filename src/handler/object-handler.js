import {getId, setId} from '../accessors/id';
import {getProperty, setProperty} from '../accessors/property';
import {Metadata} from '../metadata';
import {PersistentConfig, PropertyType} from '../persistent-config';
import {getEntity} from '../persistent-object';

export const objectHandler = {
  get: function(target, propertyKey, receiver) {
console.log(`get ${propertyKey}`);
    const config = PersistentConfig.get(target.constructor);
    const propConfig = config.getProperty(propertyKey);
    if (propConfig) {
      switch (propConfig.type) {
        case PropertyType.ID:
          return getId(receiver, propertyKey);
        case PropertyType.PROPERTY:
          return getProperty(receiver, propertyKey);
      }
    } else {
      return target[propertyKey];
    }
  },
  set: async function(target, propertyKey, value, receiver) {
    let entity = getEntity(target);
    let isRemoved = entity ? Reflect.getMetadata(Metadata.ENTITY_IS_REMOVED, entity) : false;
    if (isRemoved) {
      throw new Error('cannot set value of removed entity');
    }
    const config = PersistentConfig.get(target.constructor);
    const propConfig = config.getProperty(propertyKey);
    if (propConfig) {
      switch (propConfig.type) {
        case PropertyType.ID:
          return setId(receiver, propertyKey, value);
        case PropertyType.PROPERTY:
          return setProperty(receiver, propertyKey, value);
      }
    } else {
      target[propertyKey] = value;
    }
    return true;
  }
};
