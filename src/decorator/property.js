import {PersistentConfig} from '../persistent-config';
import {Util} from '../util';

export function Property(pathOrTarget, optPropertyKey, optDescriptor) {
  let isDecorator = Util.isPropertyDecorator(...arguments);
  let deco = function(target, propertyKey) {
    let path = isDecorator ? optPropertyKey : pathOrTarget || optPropertyKey;
    PersistentConfig.get(target).configureProperty(propertyKey, {path});
  };
  return isDecorator ?
      deco(pathOrTarget, optPropertyKey, optDescriptor) : deco;
}
