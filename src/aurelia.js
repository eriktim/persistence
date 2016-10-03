import {computedFrom} from 'aurelia-binding';

import {Config} from './config';
import {VERSION, defineSymbol} from './symbols';

export * from './index';

Config.setPropertyDecorator(computedFrom(VERSION));

const baseConfig = {
  extensible: false,
  onNewObject: function(object) {
    defineSymbol(object, '__observers__', {});
  }
};

export function configure(aurelia, callback) {
  let config = new Config();
  config.configure(baseConfig);
  if (typeof callback === 'function') {
    callback(config);
  }
}
