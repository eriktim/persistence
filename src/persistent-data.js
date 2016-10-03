import {VERSION, defineSymbol} from './symbols';
import {Util} from './util';

const dataMap = new WeakMap();
const serializedDataMap = new WeakMap(); // TODO refer per property
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

export function readValue(obj, path) {
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

function serialize(data) {
  return JSON.stringify(data || {});
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
      throw new TypeError('injection data must be an object');
    }
    if (!Reflect.has(obj, VERSION)) {
      defineSymbol(obj, VERSION, 0);
    }
    dataMap.set(obj, data);
    serializedDataMap.set(obj, serialize(data));
    obj[VERSION]++;
  }

  static isDirty(obj) {
    return serializedDataMap.get(obj) !==
        serialize(PersistentData.extract(obj));
  }
}

