import {EntityConfig} from '../entity-config';
import {Util} from '../util';

export function PostLoad(optTarget, optPropertyKey, optDescriptor) {
  let isDecorator = Util.isPropertyDecorator(...arguments);
  let deco = function(target, propertyKey, descriptor) {
    let postLoad = target[propertyKey];
    if (typeof postLoad !== 'function') {
      throw new Error(`@PostLoad ${propertyKey} is not a function`);
    }
    let config = EntityConfig.get(target);
    config.configure({postLoad});
    return Util.mergeDescriptors(descriptor, {
      configurable: true,
      enumerable: false,
      value: undefined,
      writable: false
    });
  };
  return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
}
