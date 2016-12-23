import {PropertyAccessors} from '../accessors/property';
import {PersistentConfig} from '../persistent-config';

export function Property(path?: string): PropertyDecorator {
  return function(target: PObject, propertyKey: PropertyKey) {
    PersistentConfig.get(target).configureProperty(propertyKey, {
      path: path || propertyKey
    });
  };
}
