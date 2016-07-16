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
      this.propertyMap[propertyKey] = new EntityPropertyConfig();
    }
    this.propertyMap[propertyKey].configure(config);
  }

  getProperty(propertyKey) {
    return this.propertyMap[propertyKey];
  }
}

class EntityPropertyConfig {
  getter = undefined;
  path = undefined;
  setter = undefined;
  transient = undefined;

  configure(config) {
    Object.keys(config).forEach(key => {
      if (!Reflect.has(this, key)) {
        throw new Error(`unknown entity property configuration key: ${key}`);
      }
      if (this[key]) {
        throw new Error(`entity property key '${key}' is already configured`);
      }
      this[key] = config[key];
    });
  }
}
