import { EntityConfig } from '../entity-config';
import { Util } from '../util';

export const TemporalType = Object.seal({
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss'
});

export function Temporal(typeOrTarget, optPropertyKey, optDescriptor) {
  let isDecorator = Util.isPropertyDecorator(...arguments);
  let type = TemporalType.DATETIME;
  if (!isDecorator) {
    type = typeOrTarget || TemporalType.DATETIME;
  }
  let deco = function (target, propertyKey, descriptor) {
    if (!Object.keys(TemporalType).map(key => TemporalType[key]).find(t => t === type)) {
      throw new Error(`invalid type for @Temporal() ${ propertyKey }`);
    }
    throw new Error('not yet implemented');
  };
  return isDecorator ? deco(typeOrTarget, optPropertyKey, optDescriptor) : deco;
}