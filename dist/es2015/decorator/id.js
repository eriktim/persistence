import { EntityConfig } from '../entity-config';
import { Util } from '../util';

export function Id(optTarget, optPropertyKey, optDescriptor) {
  let isDecorator = Util.isPropertyDecorator(...arguments);
  let deco = function (target, propertyKey, descriptor) {
    EntityConfig.get(target).configure({ idKey: propertyKey });
  };
  return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
}