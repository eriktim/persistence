import {PersistentConfig} from '../persistent-config';

export function PostLoad(): MethodDecorator {
  return function(target: PObject, propertyKey: PropertyKey, descriptor: PropertyDescriptor) {
    let postLoad = descriptor.value;
    if (typeof postLoad !== 'function') {
      throw new Error(`@PostLoad ${propertyKey} is not a function`);
    }
    let config = PersistentConfig.get(target);
    config.configure({postLoad});
    Reflect.deleteProperty(target, propertyKey);
  };
}
