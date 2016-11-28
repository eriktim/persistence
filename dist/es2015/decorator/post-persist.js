import { PersistentConfig } from '../persistent-config';
import { Util } from '../util';

export function PostPersist(optTarget, optPropertyKey, optDescriptor) {
  let isDecorator = Util.isPropertyDecorator(...arguments);
  let deco = function (target, propertyKey, descriptor) {
    let postPersist = target[propertyKey];
    if (typeof postPersist !== 'function') {
      throw new Error(`@PostPersist ${ propertyKey } is not a function`);
    }
    let config = PersistentConfig.get(target);
    config.configure({ postPersist });
    return Util.mergeDescriptors(descriptor, {
      configurable: true,
      enumerable: false,
      value: undefined,
      writable: true
    });
  };
  return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
}