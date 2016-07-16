import { Util } from './util';

const configurations = new WeakMap();

let defaultInstance;
let propertyDecorator;

export let Config = class Config {
  constructor() {
    const config = {
      extensible: false,
      onCreate: () => undefined,
      baseUrl: null
    };
    configurations.set(this, config);
    if (!defaultInstance) {
      defaultInstance = this;
    }
  }

  configure(userConfig) {
    let config = configurations.get(this);
    for (let key in userConfig) {
      if (!Reflect.has(config, key)) {
        throw new Error(`unknown configuration key: ${ key }`);
      }
      config[key] = userConfig[key];
    }
  }

  get current() {
    let config = {};
    Object.assign(config, configurations.get(this));
    return Object.freeze(config);
  }

  static create(userConfig) {
    let config = new Config();
    config.configure(userConfig);
    return config;
  }

  static getPropertyDecorator() {
    return propertyDecorator;
  }

  static setPropertyDecorator(decorator) {
    if (!propertyDecorator && Util.isPropertyDecorator(decorator)) {
      propertyDecorator = decorator;
    }
  }

  static getDefault() {
    return defaultInstance;
  }
};