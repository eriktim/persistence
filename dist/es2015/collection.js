function _extendableBuiltin(cls) {
  function ExtendableBuiltin() {
    var instance = Reflect.construct(cls, Array.from(arguments));
    Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
    return instance;
  }

  ExtendableBuiltin.prototype = Object.create(cls.prototype, {
    constructor: {
      value: cls,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(ExtendableBuiltin, cls);
  } else {
    ExtendableBuiltin.__proto__ = cls;
  }

  return ExtendableBuiltin;
}

import { isCollectible } from './decorator/collectible';
import { PersistentObject } from './persistent-object';
import { PersistentData } from './persistent-data';
import { VERSION } from './symbols';

const configMap = new WeakMap();

export function setCollectionData(collection, array) {
  let config = configMap.get(collection);
  config.silent = true;
  if (config.array) {
    if (config.array === array) {
      return;
    }
    collection.clear();
  }
  config.array = array;
  array.splice(0, array.length).forEach(data => {
    let item = new config.Type();
    PersistentData.inject(item, data);
    collection.add(item);
  });
  config.silent = false;
}

function versionUp(target) {
  if (target) {
    target[VERSION]++;
  }
}

let Collection = class Collection extends _extendableBuiltin(Set) {
  newItem() {
    let config = configMap.get(this);
    let item = new config.Type();
    this.add(item);
    return item;
  }

  add(item) {
    let config = configMap.get(this);
    if (!(item instanceof config.Type)) {
      throw new TypeError(`collection item must be of type '${ config.Type.name }'`);
    }
    let data = PersistentData.extract(item) || {};
    config.array.push(data);
    PersistentObject.apply(item, data, config.target);
    super.add(item);
    if (!config.silent) {
      versionUp(config.target);
    }
    return this;
  }

  clear() {
    let config = configMap.get(this);
    config.array.splice(0, config.array.length);
    super.clear();
    if (!config.silent) {
      versionUp(config.target);
    }
  }

  delete(item) {
    let config = configMap.get(this);
    let data = PersistentData.extract(item);
    let index = config.array.indexOf(data);
    config.array.splice(index, 1);
    let deleted = super.delete(item);
    versionUp(config.target);
    return deleted;
  }
};


export let CollectionFactory = class CollectionFactory {
  static create(Type, array, target) {
    if (!isCollectible(Type)) {
      throw new TypeError(`collection type must be @Collectible`);
    }
    let collection = new Collection();
    configMap.set(collection, {
      Type,
      silent: false,
      target
    });
    setCollectionData(collection, array);
    return collection;
  }
};

export function getArrayForTesting(collection) {
  let config = configMap.get(collection);
  return config ? config.array : undefined;
}