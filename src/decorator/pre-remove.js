import {PersistentConfig} from '../persistent-config';

export function PreRemove(): MethodDecorator {
  return function(target: PObject, propertyKey: PropertyKey, descriptor: PropertyDescriptor) {
    let preRemove = descriptor.value;
    if (typeof preRemove !== 'function') {
      throw new Error(`@PreRemove ${propertyKey} is not a function`);
    }
    let config = PersistentConfig.get(target);
    config.configure({preRemove});
    Reflect.deleteProperty(target, propertyKey);
  };
}
