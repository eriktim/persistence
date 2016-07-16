import { EntityConfig } from '../entity-config';
import { Util } from '../util';

export function Transient(optTarget, optPropertyKey, optDescriptor) {
  let isDecorator = Util.isPropertyDecorator(...arguments);
  let deco = function (target, propertyKey, descriptor) {
    EntityConfig.get(target).configureProperty(propertyKey, { transient: true });
  };
  return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
}