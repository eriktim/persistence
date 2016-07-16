import { EntityConfig } from '../entity-config';
import { Util } from '../util';

export function PrePersist(optTarget, optPropertyKey, optDescriptor) {
  let isDecorator = Util.isPropertyDecorator(...arguments);
  let deco = function (target, propertyKey, descriptor) {
    let prePersist = target[propertyKey];
    if (typeof prePersist !== 'function') {
      throw new Error(`@prePersist ${ propertyKey } is not a function`);
    }
    let config = EntityConfig.get(target);
    config.configure({ prePersist });
    return {
      configurable: true,
      enumerable: false,
      value: undefined,
      writable: false
    };
  };
  return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
}