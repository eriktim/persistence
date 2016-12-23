import {PersistentConfig} from '../persistent-config';

export function Embedded(Type: PClass): PropertyDecorator {
  if (!Type.isEmbeddable) {
    throw new TypeError('@Embedded type must be @Embeddable');
  }
  return function(target: PObject, propertyKey: PropertyKey) {
    let config = PersistentConfig.get(target);
    config.configureProperty(propertyKey, {});
  };
}
