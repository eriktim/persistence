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
      parameters: [Type]
    });
    let properties = Reflect.getMetadata(
        Metadata.EMBEDDED_PROPERTIES, target) || [];
    properties.push(propertyKey);
    Reflect.defineMetadata(Metadata.EMBEDDED_PROPERTIES, properties, target);
  };
}
