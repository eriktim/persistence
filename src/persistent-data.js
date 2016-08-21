import {Util} from './util';

export const VERSION = '__version__';

const dataMap = new WeakMap();
const PATH_SPLITTER = /[.\[)](.+)?/;

function getData(obj) {
  if (!dataMap.has(obj)) {
    dataMap.set(obj, {});
  }
  return dataMap.get(obj);
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

export class PersistentData {
  static getProperty(obj, path) {
    let data = getData(obj);
    return readValue(data, path);
  }

  static setProperty(obj, path, value) {
    let data = getData(obj);
    if (writeValue(data, path, value)) {
      obj[VERSION]++;
    }
  }

  static extract(obj) {
    return dataMap.has(obj) ? dataMap.get(obj) : null;
  }

  static inject(obj, data) {
    if (!Util.isObject(data)) {
      throw new Error('injection data must be an object');
    }
    if (!Reflect.has(obj, VERSION)) {
      Reflect.defineProperty(obj, VERSION, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: 1
      });
    }
    dataMap.set(obj, data);
  }
}

