import {EntityConfig} from '../entity-config';
import {EntityData} from '../entity-data';
import {Util} from '../util';

export function OneToOne(Type) {
  if (Util.isPropertyDecorator(...arguments) ||
      (Util.is(Type) && !Util.isClass(Type))) {
    throw new Error('@OneToOne requires a constructor argument');
  }
  return function(target, propertyKey, descriptor) {
    if (!Type) {
      Type = target.constructor;
    }
    let getter = function() {
      let id = EntityData.getProperty(this, propertyKey);
      console.warn('TODO @OneToOne ' + id);
    };
    let setter = function(value) {
      if (!(value instanceof Type)) {
        throw new Error(`invalid reference for '${propertyKey}':`, value);
      }
      EntityData.setProperty(this, propertyKey, getId(value));
    };
    EntityConfig.get(target).configureProperty(propertyKey, {setter, getter});
  };
}
