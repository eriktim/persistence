import {PersistentConfig} from '../persistent-config';
import {Util} from '../util';

export function PreRemove() {
  return function(target: any, propertyKey: PropertyKey, descriptor: PropertyDescriptor): PropertyDescriptor {
    let preRemove = target[propertyKey];
    if (typeof preRemove !== 'function') {
      throw new Error(`@PreRemove ${propertyKey} is not a function`);
    }
    let config = PersistentConfig.get(target);
    config.configure({preRemove});
    return Util.mergeDescriptors(descriptor, {
      configurable: true,
      enumerable: false,
      value: undefined,
      writable: true
    });
  };
}
