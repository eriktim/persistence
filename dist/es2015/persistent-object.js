import { setCollectionData } from './collection';
import { Config } from './config';
import { EntityManager } from './entity-manager';
import { PersistentConfig, PropertyType } from './persistent-config';
import { PersistentData, readValue } from './persistent-data';
import { defineSymbol, ENTITY_MANAGER, PARENT, RELATIONS, REMOVED } from './symbols';
import { Util } from './util';

const transientFieldsMap = new WeakMap();
const propertyDecorator = Config.getPropertyDecorator();

export function getEntity(obj) {
  while (obj[PARENT]) {
    obj = obj[PARENT];
  }
  return ENTITY_MANAGER in obj ? obj : null;
}

export let PersistentObject = class PersistentObject {
  static byDecoration(Target, allowOwnConstructor = false) {
    if (Target.isPersistent) {
      return undefined;
    }
    Target.isPersistent = true;

    const config = PersistentConfig.get(Target);
    const transientFields = new Set();
    for (let propertyKey in config.propertyMap) {
      const propConfig = config.getProperty(propertyKey);
      if (propConfig.type === PropertyType.TRANSIENT) {
        transientFields.add(propertyKey);
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
    transientFieldsMap.set(Target, transientFields);

    if (allowOwnConstructor) {
      return new Proxy(Target, {
        construct: function (target, argumentsList) {
          return Reflect.construct(function () {
            let data = argumentsList.length === 1 ? argumentsList[0] : {};
            PersistentObject.apply(this, data, null);
          }, argumentsList, Target);
        }
      });
    }

    return new Proxy(Target, {
      construct: function (target, argumentsList) {
        return Reflect.construct(function (entityManager) {
          if (!(entityManager instanceof EntityManager)) {
            throw new Error('Use EntityManager#create to create new entities');
          }
          defineSymbol(this, ENTITY_MANAGER, { value: entityManager, writable: false });
          defineSymbol(this, RELATIONS, { value: new Set(), writable: false });
          defineSymbol(this, REMOVED, false);
        }, argumentsList, Target);
      }
    });
  }

  static apply(obj, data, parent) {
    defineSymbol(obj, PARENT, { value: parent, writable: false });
    PersistentObject.setData(obj, data);
    let entity = getEntity(obj);
    if (entity) {
      let entityManager = entity[ENTITY_MANAGER];
      let onNewObject = entityManager.config.onNewObject;
      if (typeof onNewObject === 'function') {
        Reflect.apply(onNewObject, null, [obj, entity]);
      }
    }
    let isExtensible = obj === entity ? PersistentConfig.get(entity).isExtensible : Object.isExtensible(entity);
    if (!isExtensible) {
      let Target = Object.getPrototypeOf(obj).constructor;
      let transientFields = transientFieldsMap.get(Target);
      if (transientFields && transientFields.size) {
        transientFields.forEach(propertyKey => {
          if (!obj.hasOwnProperty(propertyKey)) {
            obj[propertyKey] = undefined;
          }
        });
      }
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