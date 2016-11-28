const configurations = new WeakMap();

let defaultInstance;
let propertyDecorator;

const defaultQueryEntityMapperFactory = Entity => {
  return function (values) {
    let map = new Map();
    (values || []).forEach(value => map.set(value, Entity));
    return map;
  };
};

function identity(val) {
  return val;
}

export let Config = class Config {
  constructor() {
    const config = {
      baseUrl: null,
      extensible: false,
      fetchInterceptor: null,
      onNewObject: () => undefined,
      queryEntityMapperFactory: defaultQueryEntityMapperFactory,
      referenceToUri: identity,
      uriToReference: identity
    };
    configurations.set(this, config);
    if (!defaultInstance) {
      defaultInstance = this;
    }
  }

  configure(userConfig = null) {
    const config = configurations.get(this);
    for (let key in userConfig || {}) {
      if (!Reflect.has(config, key)) {
        throw new Error(`unknown configuration key: ${ key }`);
      }
      config[key] = userConfig[key];
    }
  }

  plugin(plugin) {
    if (typeof plugin !== 'object' || plugin === null || typeof plugin.getPlugin !== 'function') {
      throw new Error('invalid plugin');
    }
    const config = plugin.getPlugin().config;
    this.configure(config);
    return this;
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
      throw new TypeError('property decorator must be a function');
    }
    propertyDecorator = decorator;
  }

  static getDefault() {
    return defaultInstance;
  }
};

export function resetGlobalConfigForTesting() {
  defaultInstance = undefined;
  propertyDecorator = undefined;
}