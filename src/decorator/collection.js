import {ArrayAccessors} from '../accessors/array';
import {ObjectMapper} from '../mapper/object';
import {Metadata} from '../metadata';
import {PersistentConfig} from '../persistent-config';

export function Collection(Type: PClass): PropertyDecorator {
  if (!Type || !Type.isCollectible) {
    throw new TypeError('@Collection type must be @Collectible');
  }
  return function(target: PObject, propertyKey: PropertyKey) {
    let config = PersistentConfig.get(target);
    config.configureProperty(propertyKey, {
      accessorsClass: ArrayAccessors,
      mapper: new ObjectMapper(Type)
    });
    let properties = Reflect.getMetadata(
        Metadata.ARRAY_REF_PROPERTIES, target) || [];
    properties.push(propertyKey);
    Reflect.defineMetadata(Metadata.ARRAY_REF_PROPERTIES, properties, target);
  };
}
