import { setCollectionData } from './collection';
import { Config } from './config';
import { PersistentConfig, PropertyType } from './persistent-config';
import { PersistentData, readValue } from './persistent-data';
import { defineSymbol, ENTITY_MANAGER, PARENT } from './symbols';
import { Util } from './util';

const propertyDecorator = Config.getPropertyDecorator();

export function getEntity(obj) {
  while (obj[PARENT]) {
    obj = obj[PARENT];
  }
  return obj;
}

export let PersistentObject = class PersistentObject {
  static byDecoration(Target) {
    if (Target.isPersistent) {
      return undefined;
    }
    Target.isPersistent = true;

    const config = PersistentConfig.get(Target);

    const instance = Reflect.construct(Target, []);
    for (let propertyKey in instance) {
      const propConfig = config.getProperty(propertyKey);
      if (propConfig.type === PropertyType.TRANSIENT) {
        continue;
      }
      let ownDescriptor = Object.getOwnPropertyDescriptor(Target.prototype, propertyKey) || {};
      let descriptor = Util.mergeDescriptors(ownDescriptor, {
        get: propConfig.getter,
        set: propConfig.setter
      });
      let finalDescriptor = propertyDecorator ? propertyDecorator(Target.prototype, propertyKey, descriptor) : descriptor;
      Reflect.defineProperty(Target.prototype, propertyKey, finalDescriptor);
    }

    return new Proxy(Target, {
      construct: function (target, argumentsList) {
        return Reflect.construct(function () {
          PersistentData.inject(this, {});
          Object.keys(instance).forEach(propertyKey => {
            const propConfig = config.getProperty(propertyKey);
            if (propConfig.type === PropertyType.TRANSIENT && !Reflect.has(this, propertyKey)) {
              this[propertyKey] = undefined;
            }
          });
        }, argumentsList, Target);
      }
    });
  }

  static apply(obj, data, parent) {
    defineSymbol(obj, PARENT, { value: parent, writable: false });
    PersistentObject.setData(obj, data);
    let entity = getEntity(obj);
    let entityManager = entity[ENTITY_MANAGER];
    let onNewObject = entityManager.config.onNewObject;
    if (typeof onNewObject === 'function') {
      Reflect.apply(onNewObject, null, [obj, entity]);
    }
    let isExtensible = obj === entity ? PersistentConfig.get(entity).isExtensible : Object.isExtensible(entity);
    if (!isExtensible) {
      Object.preventExtensions(obj);
    }
  }

  static setData(obj, data) {
    PersistentData.inject(obj, data);
    let entityConfig = PersistentConfig.get(obj);
    let propertyMap = entityConfig.propertyMap;
    Object.keys(propertyMap).forEach(propertyKey => {
      let config = propertyMap[propertyKey];
      if (config.type === PropertyType.COLLECTION) {
        let propData = readValue(data, config.fullPath);
        propData && setCollectionData(obj[propertyKey], propData);
      } else if (config.type === PropertyType.EMBEDDED) {
        let propData = readValue(data, config.fullPath);
        propData && PersistentObject.setData(obj[propertyKey], propData);
      }
    });
  }
};