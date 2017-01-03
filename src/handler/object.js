import {Metadata} from '../metadata';
import {PersistentConfig} from '../persistent-config';
import {getEntity} from '../persistent-object';

export const objectHandler = {
  get: function(target, propertyKey, receiver) {
    const config = PersistentConfig.get(target);
    let propConfig = config.getProperty(propertyKey);
    if (propConfig) {
      return propConfig.accessors.get(receiver);
    } else {
      return target[propertyKey];
    }
  },
  set: function(target, propertyKey, value, receiver) {
    let entity = getEntity(target);
    let isRemoved = entity ? Reflect.getMetadata(
        Metadata.ENTITY_IS_REMOVED, entity) : false;
    if (isRemoved) {
      throw new Error('cannot set value of removed entity');
    }
    const config = PersistentConfig.get(target);
    let propConfig = config.getProperty(propertyKey);
    if (propConfig) {
      return propConfig.accessors.set(receiver, value);
    } else {
      target[propertyKey] = value;
    }
    return true;
  }
};
