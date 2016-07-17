import {EntityData} from './entity-data';
import {Util} from './util';

const configurations = new WeakMap();

export class EntityConfig {
  static get(target) {
    let Target = Util.getClass(target);
    if (!configurations.has(Target)) {
      configurations.set(Target, new EntityConfig());
    }
    return configurations.get(Target);
  }

  static has(target) {
    let Target = Util.getClass(target);
    return configurations.has(Target);
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
  removed = false;

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
  transient = undefined;

  constructor(propertyKey) {
    let getPath = () => this.path || propertyKey;
    this.getter = function() {
      return EntityData.getProperty(this, getPath());
    };
    this.setter = function(value) {
      return EntityData.setProperty(this, getPath(), value);
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
