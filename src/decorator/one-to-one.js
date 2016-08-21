import {EntityConfig} from '../entity-config';
import {PersistentData} from '../persistent-data';
import {Util} from '../util';

// TODO fetch=FetchType.LAZY
export function OneToOne(Type) {
  if (Util.isPropertyDecorator(...arguments) ||
      (Util.is(Type) && !Util.isClass(Type))) {
    throw new Error('@OneToOne requires a constructor argument');
  }
  return function(target, propertyKey) {
    if (!Type) {
      Type = target.constructor;
    }
    let getter = function() {
      let id = PersistentData.getProperty(this, propertyKey);
      throw new Error('TODO @OneToOne ' + id);
    };
    let setter = function(value) {
      if (!(value instanceof Type)) {
        throw new Error(`invalid reference for '${propertyKey}':`, value);
      }
      PersistentData.setProperty(this, propertyKey, getId(value));
    };
    EntityConfig.get(target).configureProperty(propertyKey, {setter, getter});
  };
}
