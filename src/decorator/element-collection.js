import {EntityData} from '../entity-data';
import {EntityConfig} from '../entity-config';
import {Util} from '../util';

export function ElementCollection(Type) {
  if (Util.isPropertyDecorator(...arguments) || !Util.isClass(Type)) {
    throw new Error('@ElementCollection requires a constructor argument');
  }
  return function(target, propertyKey, descriptor) {
    let getter = function() {
      /*let collection = Reflect.apply(rawGetter, this, []);
      if (!Util.is(collection)) {
        collection = CollectionFactory.create(Type);
        Reflect.apply(rawSetter, this, [collection]);
      }
      return collection;*/
    };
    let setter = function(value) {
      throw new Error(`cannot replace collection in '${propertyKey}'`);
    };
    EntityConfig.get(target).configureProperty(propertyKey, {setter, getter});
  };
}
