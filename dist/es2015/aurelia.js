import { computedFrom } from 'aurelia-binding';
import { Config } from './config';
export * from './index';

Config.setPropertyDecorator(computedFrom('__version__'));

const baseConfig = {
  extensible: false,
  onCreate: function (instance) {
    Reflect.defineProperty(instance, '__observers__', {
      enumerable: false,
      configurable: true,
      value: {},
      writable: true
    });
  }
};

export function configure(aurelia, callback) {
  let config = new Config();
  config.configure(baseConfig);
  if (typeof callback === 'function') {
    callback(config);
  }
}