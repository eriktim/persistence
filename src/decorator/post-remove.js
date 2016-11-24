import {PersistentConfig} from '../persistent-config';
import {Util} from '../util';

export function PostRemove(optTarget, optPropertyKey, optDescriptor) {
  let isDecorator = Util.isPropertyDecorator(...arguments);
  let deco = function(target, propertyKey, descriptor) {
    let postRemove = target[propertyKey];
    if (typeof postRemove !== 'function') {
      throw new Error(`@PostRemove ${propertyKey} is not a function`);
    }
    let config = PersistentConfig.get(target);
    config.configure({postRemove});
    return Util.mergeDescriptors(descriptor, {
      configurable: true,
      enumerable: false,
      value: undefined,
      writable: true
    });
  };
  return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
}
