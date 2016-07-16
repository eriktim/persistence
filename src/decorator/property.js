import {EntityConfig} from '../entity-config';
import {Util} from '../util';

export function Property(pathOrTarget, optPropertyKey, optDescriptor) {
  let isDecorator = Util.isPropertyDecorator(...arguments);
  let deco = function(target, propertyKey, descriptor) {
    let path = isDecorator ? optPropertyKey : pathOrTarget || optPropertyKey;
    EntityConfig.get(target).configureProperty(propertyKey, {path});
  };
  return isDecorator ? deco(pathOrTarget, optPropertyKey, optDescriptor) : deco;
}
