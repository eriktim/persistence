import {PersistentConfig} from '../persistent-config';

export function PostPersist(): MethodDecorator {
  return function(target: PObject, propertyKey: PropertyKey, descriptor: PropertyDescriptor) {
    let postPersist = descriptor.value;
    if (typeof postPersist !== 'function') {
      throw new Error(`@PostPersist ${propertyKey} is not a function`);
    }
    let config = PersistentConfig.get(target);
    config.configure({postPersist});
    Reflect.deleteProperty(target, propertyKey);
  };
}
