import { EntityConfig } from '../entity-config';
import { Util } from '../util';

export function PostRemove(optTarget, optPropertyKey, optDescriptor) {
  let isDecorator = Util.isPropertyDecorator(...arguments);
  let deco = function (target, propertyKey, descriptor) {
    let postRemove = target[propertyKey];
    if (typeof postRemove !== 'function') {
      throw new Error(`@postRemove ${ propertyKey } is not a function`);
    }
    let config = EntityConfig.get(target);
    config.configure({ postRemove });
    return {
      configurable: true,
      enumerable: false,
      value: undefined,
      writable: false
    };
  };
  return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
}