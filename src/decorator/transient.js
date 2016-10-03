import {PersistentConfig, PropertyType} from '../persistent-config';
import {Util} from '../util';

export function Transient(optTarget, optPropertyKey, optDescriptor) {
  let isDecorator = Util.isPropertyDecorator(...arguments);
  let deco = function(target, propertyKey) {
    PersistentConfig.get(target).configureProperty(propertyKey, {
      type: PropertyType.TRANSIENT
    });
  };
  return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
}
