import {EntityConfig} from '../entity-config';
import {Util} from '../util';

export function PostPersist(optTarget, optPropertyKey, optDescriptor) {
  let isDecorator = Util.isPropertyDecorator(...arguments);
  let deco = function(target, propertyKey, descriptor) {
    let postPersist = target[propertyKey];
    if (typeof postPersist !== 'function') {
      throw new Error(`@PostPersist ${propertyKey} is not a function`);
    }
    let config = EntityConfig.get(target);
    config.configure({postPersist});
    return Util.mergeDescriptors(descriptor, {
      configurable: true,
      enumerable: false,
      value: undefined,
      writable: false
    });
  };
  return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
}
