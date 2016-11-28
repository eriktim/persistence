import {PersistentData} from './persistent-data';
import {Util} from './util';

const configurations = new WeakMap();
const propertyKeys = new Map();

export const PropertyType = Object.freeze({
  COLLECTION: 'collection',
  EMBEDDED: 'embedded',
  ID: 'id',
  TEMPORAL: 'temporal',
  TRANSIENT: 'transient'
});

function inheritConfig(config, Class) {
  // proxy-safe retrieval of super class
  let prototype = Class.prototype;
  let proto = prototype ? Reflect.getPrototypeOf(prototype) : null;
  let SuperClass = proto ? proto.constructor : null;
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

export class PersistentConfig {
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

  cacheOnly = false;
  idKey = undefined;
  nonPersistent = false;
  path = undefined;
  postLoad = undefined;
  postPersist = undefined;
  postRemove = undefined;
  preLoad = undefined;
  prePersist = undefined;
  preRemove = undefined;
  propertyMap = {};

  configure(config) {
    Object.keys(config).forEach(key => {
      if (!Reflect.has(this, key)) {
        throw new Error(`entity key '${key}' is not a valid configuration`);
      }
      if (this[key] && /^(pre|post)/.test(key)) {
        let cb1 = this[key];
        let cb2 = config[key];
        this[key] = function() {
          return Promise.resolve()
            .then(() => Reflect.apply(cb1, this, []))
            .then(() => Reflect.apply(cb2, this, []));
        };
      } else {
        if (key === 'propertyMap') {
          throw new Error('cannot configure propertyMap directly');
        }
        this[key] = config[key];
      }
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
}

class EntityPropertyConfig {
  getter = undefined;
  path = undefined;
  setter = undefined;
  type = undefined;

  get fullPath() {
    return this.path || propertyKeys.get(this);
  }

  constructor(propertyKey) {
    const config = this;
    propertyKeys.set(config, propertyKey);
    this.getter = function() {
      return PersistentData.getProperty(this, config.fullPath);
    };
    this.setter = function(value) {
      return PersistentData.setProperty(this, config.fullPath, value);
    };
  }

  configure(config) {
    Object.keys(config).forEach(key => {
      if (!Reflect.has(this, key)) {
        throw new Error(`unknown entity property configuration key: ${key}`);
      }
      this[key] = config[key];
    });
  }
}
