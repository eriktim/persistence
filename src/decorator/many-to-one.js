import {RelationshipArrayAccessors} from '../accessors/relationship-array';
import {PersistentConfig} from '../persistent-config';
import {Metadata} from '../metadata';
import {Util} from '../util';

const SELF_REF = 'self';

export function ManyToOne(Type: PClass): PropertyDecorator {
  if (Util.is(Type) && Type !== SELF_REF && !Type.isPersistent) {
    throw new Error('@ManyToOne requires a constructor argument');
  }
  return function(target: PObject, propertyKey: PropertyKey) {
    if (Type === SELF_REF) {
      Type = Object.getPrototypeOf(target).constructor;
    }
    let config = PersistentConfig.get(target);
    config.configureProperty(propertyKey, {
      accessorsClass: RelationshipArrayAccessors,
      parameters: [Type]
    });
    let properties = Reflect.getMetadata(
        Metadata.ONE_TO_ONE_PROPERTIES, target) || [];
    properties.push(propertyKey);
    Reflect.defineMetadata(Metadata.ONE_TO_ONE_PROPERTIES, properties, target);
  };
}
