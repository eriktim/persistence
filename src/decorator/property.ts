import {PersistentConfig} from '../persistent-config';

export function Property(path?: string) {
  return function(target: any, propertyKey: PropertyKey) {
    PersistentConfig.get(target).configureProperty(propertyKey, {
      path: path || propertyKey
    });
  };
}
