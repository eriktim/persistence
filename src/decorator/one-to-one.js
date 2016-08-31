import {EntityConfig} from '../entity-config';
import {getIdRef, getReference} from '../references';
import {Util} from '../util';

export function OneToOne(Type, options = {}) {
  if (Util.isPropertyDecorator(...arguments) ||
      (Util.is(Type) && !Util.isClass(Type))) {
    throw new Error('@OneToOne requires a constructor argument');
  }
  return function(target, propertyKey) {
    let config = EntityConfig.get(target).getProperty(propertyKey);
    let getter = config.getter;
    let setter = config.setter;
    config.configure({
      getter: function() {
        let idRef = Reflect.apply(getter, this, []);
        return getReference(idRef);
      },
      setter: function(val) {
        if (!(val instanceof Type)) {
          throw new Error('invalid reference object');
        }
        let idRef = getIdRef(val);
        Reflect.apply(setter, this, [idRef]);
      }
    });
  };
}
