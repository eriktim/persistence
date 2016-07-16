import {EntityConfig} from '../entity-config';
import {Util} from '../util';

export function OneToMany(TypeOrTarget, optPropertyKey, optDescriptor) {
  let isDecorator = Util.isPropertyDecorator(...arguments);
  let deco = function(target, propertyKey, descriptor) {
    throw new Error('not yet implemented');
  };
  return isDecorator ? deco(TypeOrTarget, optPropertyKey, optDescriptor) : deco;
}
