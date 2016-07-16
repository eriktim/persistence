// TODO accept propertyPath
// TODO Symbol('originalData')
// TODO get propertyPath from config
import {Util} from './util';

const VERSION = '__version__';
const dataMap = new WeakMap();

function getData(entity) {
  if (!dataMap.has(entity)) {
    dataMap.set(entity, {});
  }
  return dataMap.get(entity);
}

export class EntityData {
  static getProperty(entity, propertyPath) {
    return getData(entity)[propertyPath];
  }

  static setProperty(entity, propertyPath, value) {
    let data = getData(entity);
    if (value !== data[propertyPath]) {
      data[propertyPath] = value;
      entity[VERSION]++;
    }
  }

  static extract(entity) {
    if (!dataMap.has(entity)) {
      return null;
    }
    return dataMap.get(entity);
  }

  static inject(entity, data) {
    if (!Util.isObject(data)) {
      throw new Error('injection data must be an object');
    }
    if (!Reflect.has(entity, VERSION)) {
      Reflect.defineProperty(entity, VERSION, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: 1
      });
    }
    dataMap.set(entity, data);
    // TODO sub-objects (propertyPath)
  }
}

