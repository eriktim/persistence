import {PersistentData} from './persistent-data';
import {Util} from './util';

const configurations = new WeakMap();
const propertyKeys = new Map();

export const PropertyType = Object.freeze({
  COLLECTION: 'collection',
  EMBEDDED: 'embedded',
  TEMPORAL: 'temporal',
  TRANSIENT: 'transient'
});

export class PersistentConfig {
  static get(objectOrClass) {
    let Class = Util.getClass(objectOrClass);
    if (!configurations.has(Class)) {
      let config = new PersistentConfig();
      let SuperClass = Object.getPrototypeOf(Class);
      if (configurations.has(SuperClass)) {
        let superConfig = configurations.get(SuperClass);
        for (let key in superConfig) {
          config[key] = superConfig[key];
        }
      }
      configurations.set(Class, config);
    }
    return configurations.get(Class);
  }

  static has(objectOrClass) {
    let Class = Util.getClass(objectOrClass);
    return configurations.has(Class);
  }

  idKey = undefined;
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
      if (this[key]) {
        throw new Error(`entity key '${key}' cannot be re-configured`);
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
