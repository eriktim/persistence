import {Util} from './util';

export const VERSION = '__version__';

const dataMap = new WeakMap();
const PATH_SPLITTER = /[.\[)](.+)?/;

function getData(entity) {
  if (!dataMap.has(entity)) {
    dataMap.set(entity, {});
  }
  return dataMap.get(entity);
}

function nextProperty(path) {
  let [property, subpath] = path.split(PATH_SPLITTER);
  return [property.replace(']', ''), subpath];
}

function readValue(obj, path) {
  let [property, subpath] = nextProperty(path);
  if (subpath) {
    obj = obj[property];
    return obj ? readValue(obj, subpath) : undefined;
  }
  return obj[property];
}

function writeValue(obj, path, value) {
  let [property, subpath] = nextProperty(path);
  if (subpath) {
    if (!(property in obj)) {
      let [nextProp] = subpath.split(PATH_SPLITTER);
      obj[property] = nextProp.endsWith(']') ? [] : {};
    }
    obj = obj[property];
    return obj ? writeValue(obj, subpath, value) : false;
  }
  let update = obj[property] !== value;
  if (update) {
    obj[property] = value;
  }
  return update;
}

export class EntityData {
  static getProperty(entity, propertyPath) {
    let data = getData(entity);
    return readValue(data, propertyPath);
  }

  static setProperty(entity, propertyPath, value) {
    let data = getData(entity);
    if (writeValue(data, propertyPath, value)) {
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
  }
}

