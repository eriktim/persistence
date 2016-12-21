const configurations = new WeakMap();

let defaultInstance;
let propertyDecorator;

const defaultQueryEntityMapperFactory = Entity => {
  return function(values) {
    let map = new Map();
    (values || []).forEach(value => map.set(value, Entity));
    return map;
  };
};

function identity<T>(val: T): T {
  return val;
}

export class Config {
  constructor() {
    const config: IConfig = {
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

  configure(userConfig: IConfig = null) {
    const config = configurations.get(this);
    for (let key in userConfig || {}) {
      if (!Reflect.has(config, key)) {
        throw new Error(`unknown configuration key: ${key}`);
      }
      config[key] = userConfig[key];
    }
  }

  plugin(plugin: IPlugin) {
    if (typeof plugin !== 'object' ||
        plugin === null ||
        typeof plugin.getPlugin !== 'function') {
      throw new Error('invalid plugin');
    }
    const config = plugin.getPlugin().config;
    this.configure(config);
    return this;
  }

  get current(): IConfig {
    let config = {};
    Object.assign(config, configurations.get(this));
    return Object.freeze(config);
  }

  static create(userConfig: IConfig): Config {
    const config = new Config();
    config.configure(userConfig);
    return config;
  }

  static getPropertyDecorator(): PropertyDecorator {
    return propertyDecorator;
  }

  static setPropertyDecorator(decorator: PropertyDecorator): void {
    if (typeof decorator !== 'function') {
      throw new TypeError('property decorator must be a function');
    }
    propertyDecorator = decorator;
  }

  static getDefault(): Config {
    return defaultInstance;
  }
}

export function resetGlobalConfigForTesting(): void {
  defaultInstance = undefined;
  propertyDecorator = undefined;
}
