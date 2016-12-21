import {Util} from './util';

const configurations: WeakMap<PClass, PersistentConfig> = new WeakMap();

export const PropertyType = Object.freeze({
  COLLECTION: 'collection',
  EMBEDDED: 'embedded',
  ID: 'id',
  TEMPORAL: 'temporal'
});

function inheritConfig(config: any, Class: PClass): boolean {
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
  let superConfig: any = configurations.get(SuperClass);
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
  static get(objectOrClass: PClass|PObject): PersistentConfig {
    let Class = Util.getClass(objectOrClass);
    if (!configurations.has(Class)) {
      let config = new PersistentConfig();
      inheritConfig(config, Class);
      configurations.set(Class, config);
    }
    return configurations.get(Class);
  }

  static has(objectOrClass: PClass|PObject): boolean {
    let Class = Util.getClass(objectOrClass);
    return configurations.has(Class);
  }

  cacheOnly: boolean = false;
  idKey: string = undefined;
  nonPersistent: boolean = false;
  path: string = undefined;
  postLoad: Function = undefined;
  postPersist: Function = undefined;
  postRemove: Function = undefined;
  preLoad: Function = undefined;
  prePersist: Function = undefined;
  preRemove: Function = undefined;
  propertyMap: Object = {};

  configure(config: IPersistentConfig): void {
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

  configureProperty(propertyKey: string, config: IPersistentPropertyConfig): void {
    if (!(propertyKey in this.propertyMap)) {
      this.propertyMap[propertyKey] = new PersistentPropertyConfig(propertyKey);
    }
    this.propertyMap[propertyKey].configure(config);
  }

  getProperty(propertyKey: string): PersistentPropertyConfig {
    if (!(propertyKey in this.propertyMap)) {
      this.configureProperty(propertyKey, {});
    }
    return this.propertyMap[propertyKey];
  }
}

class PersistentPropertyConfig {
  path: string = undefined;
  propertyKey: string = undefined;
  type: string = undefined;

  get fullPath(): string {
    return this.path || this.propertyKey;
  }

  constructor(propertyKey: string) {
    this.propertyKey = propertyKey;
  }

  configure(config: IPersistentPropertyConfig): void {
    Object.keys(config).forEach(key => {
      if (!Reflect.has(this, key)) {
        throw new Error(`unknown entity property configuration key: ${key}`);
      }
      this[key] = config[key];
    });
  }
}
