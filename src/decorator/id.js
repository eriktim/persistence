import {IdAccessors} from '../accessors/id';
import {PersistentConfig} from '../persistent-config';

export function Id(): PropertyDecorator {
  return function(target: PObject, propertyKey: PropertyKey) {
    let config = PersistentConfig.get(target);
    config.configure({
      idKey: propertyKey
    });
    config.configureProperty(propertyKey, {
      accessorsClass: IdAccessors
    });
  };
}
