import {TemporalAccessors} from '../accessors/temporal';
import {PersistentConfig} from '../persistent-config';

export function Temporal() {
  return function(target: PObject, propertyKey: PropertyKey) {
    let config = PersistentConfig.get(target);
    config.configure({idKey: propertyKey});
    config.configureProperty(propertyKey, {
      accessorsClass: TemporalAccessors
    });
  };
}
