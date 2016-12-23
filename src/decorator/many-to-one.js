import {PersistentConfig} from '../persistent-config';
import {Util} from '../util';

const SELF_REF = 'self';

export function ManyToOne(Type: PClass): PropertyDecorator {
  if (Util.is(Type) && Type !== SELF_REF || !Type.isPersistent) {
    throw new Error('@ManyToOne requires a constructor argument');
  }
  return function(target: PObject, propertyKey: PropertyKey) {
    let config = PersistentConfig.get(target);
//    config.configureProperty(propertyKey, {});
  };
}
