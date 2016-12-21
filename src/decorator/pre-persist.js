import {PersistentConfig} from '../persistent-config';

export function PrePersist(): MethodDecorator {
  return function(target: PObject, propertyKey: PropertyKey, descriptor: PropertyDescriptor) {
    let prePersist = descriptor.value;
    if (typeof prePersist !== 'function') {
      throw new Error(`@PrePersist ${propertyKey} is not a function`);
    }
    let config = PersistentConfig.get(target);
    config.configure({prePersist});
    Reflect.deleteProperty(target, propertyKey);
  };
}
