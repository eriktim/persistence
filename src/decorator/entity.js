import {EntityConfig} from '../entity-config';
import {EntityManager} from '../entity-manager';
import {persistify} from '../persistify';
import {Util} from '../util';

export function Entity(pathOrTarget) {
  const isDecorator = Util.isClassDecorator(...arguments);
  const deco = function(Target) {
    // configure the remote path for the Entity
    const defaultPath = Target.name.toLowerCase(); // FIXME warn Function.name
    const path = isDecorator ? defaultPath : pathOrTarget || defaultPath;
    const config = EntityConfig.get(Target);
    config.configure({path});

    return persistify(Target, function(instance, entityManager) {
      if (!(entityManager instanceof EntityManager)) {
        throw new Error(
            `Entity '${Target.name}' must be created by an EntityManager`);
      }
      if (typeof entityManager.config.onCreate === 'function') {
        Reflect.apply(entityManager.config.onCreate, null, [this]);
      }
      if (!entityManager.config.extensible) {
        Object.keys(instance).forEach(propertyKey => {
          const propConfig = config.getProperty(propertyKey);
          if (propConfig.transient && !Reflect.has(this, propertyKey)) {
            this[propertyKey] = undefined;
          }
        });
        Object.preventExtensions(this);
      }
    });
  };
  return isDecorator ? deco(pathOrTarget) : deco;
}
