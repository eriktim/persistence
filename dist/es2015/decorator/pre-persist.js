import { PersistentConfig } from '../persistent-config';
import { Util } from '../util';

export function PrePersist(optTarget, optPropertyKey, optDescriptor) {
  let isDecorator = Util.isPropertyDecorator(...arguments);
  let deco = function (target, propertyKey, descriptor) {
    let prePersist = target[propertyKey];
    if (typeof prePersist !== 'function') {
      throw new Error(`@PrePersist ${ propertyKey } is not a function`);
    }
    let config = PersistentConfig.get(target);
    config.configure({ prePersist });
    return Util.mergeDescriptors(descriptor, {
      configurable: true,
      enumerable: false,
      value: undefined,
      writable: true
    });
  };
  return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
}