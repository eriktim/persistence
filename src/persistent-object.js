import {constructionHandlerFactory} from './handler/construction-handler';
import {setCollectionData} from './collection';
import {Config} from './config';
import {Metadata} from './metadata';
import {PersistentConfig, PropertyType} from './persistent-config';
import {PersistentData, readValue} from './persistent-data';

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

    let config = PersistentConfig.get(Target);
    for (let propertyKey of config.hookProperties) {
      Reflect.deleteProperty(Target.prototype, propertyKey);
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
    let isExtensible = obj === entity ?
        PersistentConfig.get(entity).isExtensible : Object.isExtensible(entity);
    if (!isExtensible) {
      Object.preventExtensions(obj);
    }
  }

  static setData(obj: PObject, data: Object) {
    PersistentData.inject(obj, data);
    clearMetadata(obj, Metadata.EMBEDDED_PROPERTIES, Metadata.EMBEDDED);
    clearMetadata(obj, Metadata.COLLECTION_PROPERTIES, Metadata.COLLECTION);
  }
}
