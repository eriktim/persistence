import {PARENT, VERSION, defineSymbol} from './symbols';
import {Util} from './util';

const dataMap = new WeakMap();
const serializedDataMap = new WeakMap(); // TODO refer per property

const SEARCH_FIELDS = Symbol('searchFields');
const COMMA_WITH_SPACE = /\s*,\s*/;
const DOT_OUTSIDE_BRACKETS = /\.(?=(?:[^\]]|\[[^\]]*\])*$)/;
const EQUAL_SIGN_WITH_SPACE = /\s*=\s*/;

function getData(obj) {
  if (!dataMap.has(obj)) {
    dataMap.set(obj, {});
  }
  return dataMap.get(obj);
}

function toDefaultValuesObject(orgObj) {
  let obj = {};
  obj[SEARCH_FIELDS] = [];
  for (let prop in orgObj) {
    let val = orgObj[prop];
    if (/^\(.*\)$/.test(prop)) {
      prop = prop.substring(1, prop.length - 1);
    } else {
      obj[SEARCH_FIELDS].push(prop);
    }
    if (Array.isArray(val)) {
      obj[prop] = val.map(toDefaultValuesObject);
    } else if (typeof val === 'object') {
      obj[prop] = val === null ? null : toDefaultValuesObject(val);
    } else {
      obj[prop] = val;
    }
  }
  return obj;
}

function keyToObject(key) {
  let keyObj = {};
  if (key.startsWith('{')) {
    try {
      let obj = JSON.parse(key);
      keyObj = toDefaultValuesObject(obj);
    } catch (e) {
      throw new Error('invalid JSON key: ' + key);
    }
  } else {
    key.split(COMMA_WITH_SPACE).forEach(tuple => {
      let [p, v] = tuple.split(EQUAL_SIGN_WITH_SPACE);
      keyObj[p] = v;
    });
  }
  return keyObj;
}

function findArrayItemByObject(arr, searchObj) {
  if (!Array.isArray(arr)) {
    return null;
  }
  function equal(obj, ref) {
    if (typeof obj !== typeof ref) {
      return false;
    }
    if (typeof obj !== 'object') {
      return obj === ref;
    }
    if (obj === null || ref === null) {
      return obj === null && ref === null;
    }
    let keys = SEARCH_FIELDS in ref ? ref[SEARCH_FIELDS] : Object.keys(ref);
    return !keys.find(key => !equal(obj[key], ref[key]));
  }
  return arr.find(item => equal(item, searchObj));
}

function getArrayKeys(path) {
  let keys = [];
  let openBrackets = 0;
  let bracketsStart = -1;
  for (let i = path.indexOf('['); i < path.length; i++) {
    if (path[i] === '[') {
      if (bracketsStart < 0) {
        bracketsStart = i;
      }
      openBrackets++;
    } else {
      if (bracketsStart < 0) {
        throw new Error('invalid array keys: ' + path);
      }
      if (path[i] === ']') {
        openBrackets--;
        if (!openBrackets) {
          keys.push(path.substring(bracketsStart + 1, i));
          bracketsStart = -1;
        }
      }
    }
  }
  return keys;
}

function getObjectFromArray(baseObj, path, options = {}) {
  let allowCreation = options.allowCreation || false;
  let isArray = options.isArray || false;
  let keys = getArrayKeys(path);
  let prop = path.substring(0, path.indexOf('['));
  if (!(prop in baseObj)) {
    if (!allowCreation) {
      return undefined;
    }
    baseObj[prop] = [];
  }
  let obj = baseObj[prop];
  if (!Array.isArray(obj)) {
    return undefined;
  }
  let index = 0;
  for (let key of keys) {
    let lastKey = index++ === keys.length - 1;
    if (Util.isInt(key)) {
      if (!(key in obj)) {
        if (!allowCreation) {
          obj = undefined;
          break;
        }
        obj[key] = lastKey && !isArray ? {} : [];
      }
      obj = obj[key];
    } else {
      if (!lastKey) {
        // smart array index must refer to an object
        // as we search for a matching object
        throw new Error(`invalid array index: ${path}`);
      }
      let keyObj = keyToObject(key);
      let arr = obj;
      obj = findArrayItemByObject(arr, keyObj);
      if (!obj) {
        if (allowCreation) {
          obj = keyObj;
          arr.push(obj);
        } else {
          break;
        }
      }
    }
  }
  return obj;
}

export function readValue(baseObj, fullPath) {
  let obj = baseObj;
  for (let prop of fullPath.split(DOT_OUTSIDE_BRACKETS)) {
    if (prop.charAt(prop.length - 1) === ']') {
      obj = getObjectFromArray(obj, prop);
    } else {
      obj = obj[prop];
    }
    if (typeof obj !== 'object' || obj === null) {
      break;
    }
  }
  return obj;
}

function writeValue(baseObj, fullPath, value) {
  let obj = baseObj;
  let props = fullPath.split(DOT_OUTSIDE_BRACKETS);
  let lastProp = props.pop();
  let isArrayElement = lastProp.endsWith(']');
  if (isArrayElement) {
    let index = lastProp.lastIndexOf('[');
    props.push(lastProp.substring(0, index));
    lastProp = lastProp.substring(index + 1, lastProp.length - 1);
  }
  props.forEach((prop, index) => {
    let endWithArray = isArrayElement && index === props.length - 1;
    if (prop.endsWith(']')) {
      obj = getObjectFromArray(obj, prop, {
        allowCreation: true,
        isArray: endWithArray
      });
    } else {
      if (!(prop in obj)) {
        obj[prop] = endWithArray ? [] : {};
      }
      obj = obj[prop];
    }
  });
  let update = obj ? obj[lastProp] !== value : false;
  if (update) {
    obj[lastProp] = value;
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
      do {
        obj[VERSION]++;
        obj = obj[PARENT];
      } while (obj);
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
    this.setNotDirty(obj);
    obj[VERSION]++;
  }

  static isDirty(obj) {
    return serializedDataMap.get(obj) !==
      serialize(PersistentData.extract(obj));
  }

  static setNotDirty(obj) {
    let data = PersistentData.extract(obj);
    serializedDataMap.set(obj, serialize(data));
  }
}

