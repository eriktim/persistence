import {PersistentConfig, PropertyType} from '../persistent-config';
import {Util} from '../util';

export function Id(optTarget, optPropertyKey, optDescriptor) {
  let isDecorator = Util.isPropertyDecorator(...arguments);
  let deco = function(target, propertyKey) {
    let config = PersistentConfig.get(target);
    config.configure({
      idKey: propertyKey
    });
    config.configureProperty(propertyKey, {type: PropertyType.ID});
  };
  return isDecorator ? deco(optTarget, optPropertyKey, optDescriptor) : deco;
}
