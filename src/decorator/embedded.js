import {EntityConfig} from '../entity-config';
import {Util} from '../util';

export function Embedded(Type) {
  let isDecorator = Util.isPropertyDecorator(...arguments);
  return function(target, propertyKey, descriptor) {
    throw new Error('not yet implemented');
  };
}
