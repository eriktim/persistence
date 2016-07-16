import { EntityData } from '../entity-data';
import { EntityConfig } from '../entity-config';
import { Util } from '../util';

export function ElementCollection(Type) {
  if (Util.isPropertyDecorator(...arguments) || !Util.isClass(Type)) {
    throw new Error('@ElementCollection requires a constructor argument');
  }
  return function (target, propertyKey, descriptor) {
    let getter = function () {};
    let setter = function (value) {
      throw new Error(`cannot replace collection in '${ propertyKey }'`);
    };
    EntityConfig.get(target).configureProperty(propertyKey, { setter, getter });
  };
}