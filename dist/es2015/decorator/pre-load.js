import { EntityConfig } from '../entity-config';
import { Util } from '../util';

export function PreLoad(optTarget, optPropertyKey, optDescriptor) {
  let isDecorator = Util.isPropertyDecorator(...arguments);
  let deco = function (target, propertyKey, descriptor) {
    let preLoad = target[propertyKey];
    if (typeof preLoad !== 'function') {
      throw new Error(`@preLoad ${ propertyKey } is not a function`);
    }
    let config = EntityConfig.get(target);
    config.configure({ preLoad });
    return {
      configurable: true,
      enumerable: false,
      value: undefined,
      writable: false
    };
  };
  return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
}