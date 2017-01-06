import {ObjectMapper} from '../accessors/mapper';
import {ObjectAccessors} from '../accessors/object';
import {Metadata} from '../metadata';
import {PersistentConfig} from '../persistent-config';

export function Embedded(Type: PClass): PropertyDecorator {
  if (!Type || !Type.isEmbeddable) {
    throw new TypeError('@Embedded type must be @Embeddable');
  }
  return function(target: PObject, propertyKey: PropertyKey) {
    let config = PersistentConfig.get(target);
    config.configureProperty(propertyKey, {
      accessorsClass: ObjectAccessors,
      mapper: new ObjectMapper(Type)
    });
    let properties = Reflect.getMetadata(
        Metadata.OBJECT_REF_PROPERTIES, target) || [];
    properties.push(propertyKey);
    Reflect.defineMetadata(Metadata.OBJECT_REF_PROPERTIES, properties, target);
  };
}
