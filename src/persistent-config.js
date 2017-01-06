import {PrimitiveAccessors} from './accessors/primitive';

import {Util} from './util';

const configurations: WeakMap<PClass, PersistentConfig> = new WeakMap();

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
      config.target = Class;
      configurations.set(Class, config);
    }
    return configurations.get(Class);
  }

  static has(objectOrClass: PClass|PObject): boolean {
    let Class = Util.getClass(objectOrClass);
    return configurations.has(Class);
  }

  cacheOnly: boolean = false;
  hookProperties: PropertyKey[] = [];
  idKey: string = undefined;
  nonPersistent: boolean = false;
  path: string = undefined;
  postLoad: Function = undefined;
  postPersist: Function = undefined;
  postRemove: Function = undefined;
  postUpdate: Function = undefined;
  preLoad: Function = undefined;
  prePersist: Function = undefined;
  preRemove: Function = undefined;
  preUpdate: Function = undefined;
  propertyMap: Object = Object.create(null);
  target: PClass;

  configure(config: IPersistentConfig): void {
    Object.keys(config).forEach(key => {
      if (!Reflect.has(this, key)) {
        throw new Error(`entity key '${key}' is not a valid configuration`);
      }
      if (this[key] && /^(pre|post)/.test(key)) {
        let cb1 = this[key];
        let cb2 = config[key];
        if (/Update$/.test(key)) {
          this[key] = function() {
            Reflect.apply(cb1, this, []);
            Reflect.apply(cb2, this, []);
          };
        } else {
          this[key] = function() {
            return Promise.resolve()
              .then(() => Reflect.apply(cb1, this, []))
              .then(() => Reflect.apply(cb2, this, []));
          };
        }
      } else {
        if (key === 'propertyMap') {
          throw new Error('cannot configure propertyMap directly');
        }
        this[key] = config[key];
      }
    });
  }

  configureProperty(propertyKey: string, config: IPersistentPropertyConfig): void {
    if (!(Reflect.has(this.propertyMap, propertyKey))) {
      this.propertyMap[propertyKey] = new PersistentPropertyConfig(this, propertyKey);
      if (!Reflect.has(this.target.prototype, propertyKey)) {
        Reflect.defineProperty(this.target.prototype, propertyKey, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: '(persistent)'
        });
      }
    }
    this.propertyMap[propertyKey].configure(config);
  }

  getProperty(propertyKey: string): PersistentPropertyConfig {
    return this.propertyMap[propertyKey] || null;
  }
}

class PersistentPropertyConfig {
  accessors: PrimitiveAccessors;
  config: PersistentConfig;
  path: string;
  propertyKey: string;
  typeIsDefined: boolean;

  get fullPath(): string {
    return this.path || this.propertyKey;
  }

  constructor(config: PersistentConfig, propertyKey: string) {
    this.config = config;
    this.propertyKey = propertyKey;
    this.typeIsDefined = false;
  }

  configure(config: IPersistentPropertyConfig): void {
    Object.keys(config).forEach(key => {
      switch(key) {
        case 'path':
          this.path = config[key];
          break;
        case 'accessorsClass':
          if (this.typeIsDefined) {
            throw new Error('already configured property type');
          }
          this.accessors = Reflect.construct(config[key], [this.config, this.propertyKey, config.mapper]);
          this.typeIsDefined = true;
          break;
        case 'mapper':
          // see 'accessorsClass'
          break;
        default:
          throw new Error(`entity key '${key}' is not a valid configuration`);
      }
    });
    if (!this.typeIsDefined) {
      this.accessors = new PrimitiveAccessors(this.config, this.propertyKey);
    }
  }
}
