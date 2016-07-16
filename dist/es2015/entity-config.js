import { Util } from './util';

const configurations = new WeakMap();

export let EntityConfig = class EntityConfig {
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
    this.removed = false;
  }

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

  configure(config) {
    Object.keys(config).forEach(key => {
      if (!Reflect.has(this, key)) {
        throw new Error(`entity key '${ key }' is not a valid configuration`);
      }
      if (this[key]) {
        throw new Error(`entity key '${ key }' cannot be re-configured`);
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
};

let EntityPropertyConfig = class EntityPropertyConfig {
  constructor() {
    this.getter = undefined;
    this.path = undefined;
    this.setter = undefined;
    this.transient = undefined;
  }

  configure(config) {
    Object.keys(config).forEach(key => {
      if (!Reflect.has(this, key)) {
        throw new Error(`entity property key '${ key }' is not a valid configuration`);
      }
      if (this[key]) {
        throw new Error(`entity property key '${ key }' is already configured`);
      }
      this[key] = config[key];
    });
  }
};