import {Util} from '../util';

export function ManyToOne(TypeOrTarget, optPropertyKey, optDescriptor) {
  let isDecorator = Util.isPropertyDecorator(...arguments);
  let deco = function(target, propertyKey, descriptor) {
    throw new Error('not yet implemented');
  };
  // fetch=FetchType.LAZY
  return isDecorator ? deco(TypeOrTarget, optPropertyKey, optDescriptor) : deco;
}
