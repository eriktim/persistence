import {EntityConfig} from '../entity-config';
import {EntityManager} from '../entity-manager';
import {Persistent} from '../persistent';
import {REMOVED, defineSymbol} from '../symbols';
import {Util} from '../util';

export function Entity(pathOrTarget) {
  const isDecorator = Util.isClassDecorator(...arguments);
  const deco = function(Target) {
    // configure the remote path for the Entity
    const defaultPath = Target.name.toLowerCase(); // FIXME warn Function.name
    const path = isDecorator ? defaultPath : pathOrTarget || defaultPath;
    const config = EntityConfig.get(Target);
    config.configure({path});

    return Persistent.decorate(Target, function(entityManager) {
      if (!(entityManager instanceof EntityManager)) {
        throw new Error(
            `Entity '${Target.name}' must be created by an EntityManager`);
      }
      if (typeof entityManager.config.onCreate === 'function') {
        Reflect.apply(entityManager.config.onCreate, null, [this]);
      }
      defineSymbol(this, REMOVED, false);
      if (!entityManager.config.extensible) {
        Object.preventExtensions(this);
      }
    });
  };
  return isDecorator ? deco(pathOrTarget) : deco;
}
