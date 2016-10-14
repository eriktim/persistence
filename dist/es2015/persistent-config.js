import { PersistentData } from './persistent-data';
import { Util } from './util';

const configurations = new WeakMap();
const propertyKeys = new Map();

export const PropertyType = Object.freeze({
  COLLECTION: 'collection',
  EMBEDDED: 'embedded',
  TEMPORAL: 'temporal',
  TRANSIENT: 'transient'
});

function inheritConfig(config, Class) {
  let SuperClass = Object.getPrototypeOf(Class);
  if (!SuperClass) {
    return false;
  }
  if (!configurations.has(SuperClass)) {
    return inheritConfig(config, SuperClass);
  }
  let superConfig = configurations.get(SuperClass);
  for (let key in superConfig) {
    if (key === 'propertyMap') {
      Object.assign(config[key], superConfig[key]);
    } else {
      config[key] = superConfig[key];
    }
  }
  return true;
}

export let PersistentConfig = class PersistentConfig {
  constructor() {
    this.idKey = undefined;
    this.path = undefined;
    this.postLoad = undefined;
    this.postPersist = undefined;
    this.postRemove = undefined;
    this.preLoad = undefined;
    this.prePersist = undefined;
    this.preRemove = undefined;
    this.propertyMap = {};
  }

  static get(objectOrClass) {
    let Class = Util.getClass(objectOrClass);
    if (!configurations.has(Class)) {
      let config = new PersistentConfig();
      inheritConfig(config, Class);
      configurations.set(Class, config);
    }
    return configurations.get(Class);
  }

  static has(objectOrClass) {
    let Class = Util.getClass(objectOrClass);
    return configurations.has(Class);
  }

  configure(config) {
    Object.keys(config).forEach(key => {
      if (!Reflect.has(this, key)) {
        throw new Error(`entity key '${ key }' is not a valid configuration`);
      }
      if (this[key]) {
        if (/^(pre|post)/.test(key)) {
          let cb1 = this[key];
          let cb2 = config[key];
          this[key] = function () {
            Reflect.apply(cb1, this, []);
            Reflect.apply(cb2, this, []);
          };
          return;
        }
        throw new Error(`entity key '${ key }' cannot be re-configured`);
      }
      this[key] = config[key];
    });
  }

  configureProperty(propertyKey, config) {
    if (!(propertyKey in this.propertyMap)) {
      this.propertyMap[propertyKey] = new EntityPropertyConfig(propertyKey);
    }
    this.propertyMap[propertyKey].configure(config);
  }

  getProperty(propertyKey) {
    if (!(propertyKey in this.propertyMap)) {
      this.configureProperty(propertyKey, {});
    }
    return this.propertyMap[propertyKey];
  }
};

let EntityPropertyConfig = class EntityPropertyConfig {

  get fullPath() {
    return this.path || propertyKeys.get(this);
  }

  constructor(propertyKey) {
    this.getter = undefined;
    this.path = undefined;
    this.setter = undefined;
    this.type = undefined;

    const config = this;
    propertyKeys.set(config, propertyKey);
    this.getter = function () {
      return PersistentData.getProperty(this, config.fullPath);
    };
    this.setter = function (value) {
      return PersistentData.setProperty(this, config.fullPath, value);
    };
  }

  configure(config) {
    Object.keys(config).forEach(key => {
      if (!Reflect.has(this, key)) {
        throw new Error(`unknown entity property configuration key: ${ key }`);
      }
      this[key] = config[key];
    });
  }
};