const configurations = new WeakMap();

let defaultInstance;
let propertyDecorator;

export class Config {
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
    const config = configurations.get(this);
    for (let key in userConfig || {}) {
      if (!Reflect.has(config, key)) {
        throw new Error(`unknown configuration key: ${key}`);
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
    const config = new Config();
    config.configure(userConfig);
    return config;
  }

  static getPropertyDecorator() {
    return propertyDecorator;
  }

  static setPropertyDecorator(decorator) {
    if (typeof decorator !== 'function') {
      throw new Error('property decorator must be a function');
    }
    propertyDecorator = decorator;
  }

  static getDefault() {
    return defaultInstance;
  }
}

export function resetGlobalConfigForTesting() {
  defaultInstance = undefined;
  propertyDecorator = undefined;
}
