import {setCollectionData} from './collection';
import {Config} from './config';
import {EntityManager} from './entity-manager';
import {PersistentConfig, PropertyType} from './persistent-config';
import {PersistentData, readValue} from './persistent-data';
import {defineSymbol, ENTITY_MANAGER, PARENT, RELATIONS, REMOVED}
    from './symbols';

const propertyDecorator = Config.getPropertyDecorator();

export function getEntity(obj) {
  while (obj[PARENT]) {
    obj = obj[PARENT];
  }
  return ENTITY_MANAGER in obj ? obj : null;
}

const arrayHandler = {
  get: function(target, property) {
    return target[property];
  },
  set: function(target, property, value) {
    target[property] = value;
    return true;
  }
};

const objectHandler = {
  get: function(target, property) {
    const config = PersistentConfig.get(target.constructor);
    const propConfig = config.getProperty(property);
    if (propConfig) {
      return Reflect.apply(propConfig.getter, target, []);
    } else {
      return target[property];
    }
  },
  set: function(target, property, value) {
    const config = PersistentConfig.get(target.constructor);
    const propConfig = config.getProperty(property);
    if (propConfig) {
      Reflect.apply(propConfig.setter, target, [value]);
    } else if (Reflect.has(target, property) || Object.isExtensible(target)) {
      target[property] = value;
    }
    return true;
  }
};

export class PersistentObject {
  static byDecoration(Target, allowOwnConstructor = false) {
    if (Target.hasOwnProperty('isPersistent')) {
      return undefined;
    }
    Target.isPersistent = true;

    if (allowOwnConstructor) {
      return new Proxy(Target, {
        construct: function(target, argumentsList) {
          return Reflect.construct(function() {
            let data = argumentsList.length === 1 ? argumentsList[0] : {};
            PersistentObject.apply(this, data, null);
          }, argumentsList, Target);
        }
      });
    }

    // create proxy to override constructor
    return new Proxy(Target, {
      construct: function(target, argumentsList) {
        return Reflect.construct(function(entityManager) {
          if (!(entityManager instanceof EntityManager)) {
            throw new Error('Use EntityManager#create to create new entities');
          }
          defineSymbol(this, ENTITY_MANAGER,
              {value: entityManager, writable: false});
          defineSymbol(this, RELATIONS, {value: new Set(), writable: false});
          defineSymbol(this, REMOVED, false);
        }, argumentsList, Target);
      }
    });
  }

  static apply(obj, data, parent) {
    defineSymbol(obj, PARENT, {value: parent, writable: false});
    PersistentObject.setData(obj, data);
    let entity = getEntity(obj);
    if (entity) {
      let entityManager = entity[ENTITY_MANAGER];
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

  static setData(obj, data) {
    PersistentData.inject(obj, data);
    let entityConfig = PersistentConfig.get(obj);
    let propertyMap = entityConfig.propertyMap;
    Object.keys(propertyMap)
      .forEach(propertyKey => {
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
}
