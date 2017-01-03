import {ArrayAccessors} from '../accessors/array';
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
      parameters: [Type]
    });
    let properties = Reflect.getMetadata(
        Metadata.COLLECTION_PROPERTIES, target) || [];
    properties.push(propertyKey);
    Reflect.defineMetadata(Metadata.COLLECTION_PROPERTIES, properties, target);
  };
}
