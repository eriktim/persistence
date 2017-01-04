import {constructionHandlerFactory} from './handler/construction';
import {Metadata} from './metadata';
import {PersistentConfig} from './persistent-config';
import {PersistentData} from './persistent-data';

export function getEntity(obj: PObject) {
  while (Reflect.hasMetadata(Metadata.PARENT, obj)) {
    obj = Reflect.getMetadata(Metadata.PARENT, obj);
  }
  return Reflect.hasMetadata(Metadata.ENTITY_MANAGER, obj) ? obj : null;
}

function clearMetadata(obj: PObject, propertiesKey: string, key: string) {
  let properties = Reflect.getMetadata(propertiesKey, obj);
  if (properties) {
    properties.forEach(prop => Reflect.deleteMetadata(key, obj, prop));
  }
}

export class PersistentObject {
  static byDecoration(Target: PClass, isEntity: boolean = false): PClass {
    if (Target.hasOwnProperty('isPersistent')) {
      return undefined;
    }
    Target.isPersistent = true;

    // remove all hook properties
    let prototype = Target.prototype;
    while (prototype) {
      let config = PersistentConfig.get(prototype.constructor);
      for (let propertyKey of config.hookProperties) {
        Reflect.deleteProperty(prototype, propertyKey);
      }
      prototype = Object.getPrototypeOf(prototype);
    }
    return new Proxy(Target, constructionHandlerFactory(isEntity));
  }

  static apply(obj: PObject, data: Object, parent?: PObject) {
    Reflect.defineMetadata(Metadata.PARENT, parent, this);
    PersistentObject.setData(obj, data);
    let entity = getEntity(obj);
    if (entity) {
      let entityManager = Reflect.getMetadata(Metadata.ENTITY_MANAGER, entity);
      let onNewObject = entityManager.config.onNewObject;
      if (typeof onNewObject === 'function') {
        Reflect.apply(onNewObject, null, [obj, entity]);
      }
    }
    for (let propertyKey in obj) {
      Reflect.defineProperty(obj, propertyKey, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: undefined
      });
    }
    let isExtensible = obj === entity ?
        PersistentConfig.get(entity).isExtensible : Object.isExtensible(entity);
    if (!isExtensible) {
      Object.preventExtensions(obj);
    }
  }

  static setData(obj: PObject, data: Object) {
    PersistentData.inject(obj, data);
    clearMetadata(obj, Metadata.COLLECTION_PROPERTIES, Metadata.COLLECTION);
    clearMetadata(obj, Metadata.EMBEDDED_PROPERTIES, Metadata.EMBEDDED);
    clearMetadata(obj, Metadata.ONE_TO_ONE_PROPERTIES, Metadata.ONE_TO_ONE);
  }
}
