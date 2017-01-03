import {computedFrom} from 'aurelia-binding';

import {Config} from './config';

export * from './index';

//Config.setPropertyDecorator(computedFrom(VERSION)); // FIXME, both version and setPropertyDecorator are deprecated

const baseConfig = {
  extensible: false,
  onNewObject: function(object) {
    Reflect.defineProperty(object, '__observers__', {
      configurable: true,
      enumerable: false,
      writable: true,
      value: {}
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
