import {constructionHandler} from './handler/construction-handler';
import {setCollectionData} from './collection';
import {Config} from './config';
import {PersistentData, readValue} from './persistent-data';
import {defineSymbol, ENTITY_MANAGER, PARENT, RELATIONS, REMOVED}
    from './symbols';

const propertyDecorator = Config.getPropertyDecorator();

export function getEntity(obj: PObject) {
  while (obj[PARENT]) {
    obj = obj[PARENT];
  }
  return ENTITY_MANAGER in obj ? obj : null;
}

export class PersistentObject {
  static byDecoration(Target: PClass): PClass {
    if (Target.hasOwnProperty('isPersistent')) {
      return undefined;
    }
    Target.isPersistent = true;

    return new Proxy(Target, constructionHandler);
  }

  static async apply(obj: PObject, data: Object, parent?: PObject) {
    // defineSymbol(obj, PARENT, {value: parent, writable: false});
    PersistentObject.setData(obj, data);
    // let entity = getEntity(obj);
    // if (entity) {
    //   let entityManager = entity[ENTITY_MANAGER];
    //   let onNewObject = entityManager.config.onNewObject;
    //   if (typeof onNewObject === 'function') {
    //     Reflect.apply(onNewObject, null, [obj, entity]);
    //   }
    // }
    // let isExtensible = obj === entity ?
    //     PersistentConfig.get(entity).isExtensible : Object.isExtensible(entity);
    // if (!isExtensible) {
    //   Object.preventExtensions(obj);
    // }
  }

  static setData(obj: PObject, data: Object) {
    PersistentData.inject(obj, data);
    // let entityConfig = PersistentConfig.get(obj);
    // let propertyMap = entityConfig.propertyMap;
    // Object.keys(propertyMap)
    //   .forEach(propertyKey => {
    //     let config = propertyMap[propertyKey];
    //     if (config.type === PropertyType.COLLECTION) {
    //       let propData = readValue(data, config.fullPath);
    //       propData && setCollectionData(obj[propertyKey], propData);
    //     } else if (config.type === PropertyType.EMBEDDED) {
    //       let propData = readValue(data, config.fullPath);
    //       propData && PersistentObject.setData(obj[propertyKey], propData);
    //     }
    //   });
  }
}
