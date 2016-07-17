import {Config} from '../config';
import {EntityConfig} from '../entity-config';
import {EntityData} from '../entity-data';
import {EntityManager} from '../entity-manager';
import {Util} from '../util';

const propertyDecorator = Config.getPropertyDecorator();

export function Entity(pathOrTarget) {
  const isDecorator = Util.isClassDecorator(...arguments);
  const deco = function(Target) {
    // configure the remote path for the Entity
    const defaultPath = Target.name.toLowerCase();
    const path = isDecorator ? defaultPath : pathOrTarget || defaultPath;
    const config = EntityConfig.get(Target);
    config.configure({path});

    // decorate properties
    const instance = Reflect.construct(Target, []);
    Object.keys(instance).forEach(propertyKey => {
      const propConfig = config.getProperty(propertyKey);
      if (propConfig.transient) {
        return;
      }
      let ownDescriptor = Object.getOwnPropertyDescriptor(
          Target.prototype, propertyKey) || {};
      let descriptor = Util.mergeDescriptors(ownDescriptor, {
        get: propConfig.getter,
        set: propConfig.setter
      });
      let finalDescriptor = propertyDecorator ?
          propertyDecorator(target, propertyKey, descriptor) : descriptor;
      Reflect.defineProperty(Target.prototype, propertyKey, finalDescriptor);
    });

    // create proxy to override constructor
    return new Proxy(Target, {
      construct: function(target, argumentsList) {
        return Reflect.construct(function(entityManager) {
          if (!(entityManager instanceof EntityManager)) {
            throw new Error(
                `Entity '${Target.name}' must be created by an EntityManager`);
          }
          EntityData.inject(this, {});
          if (typeof entityManager.config.onCreate === 'function') {
            Reflect.apply(entityManager.config.onCreate, null, [this]);
          }
          if (!entityManager.config.extensible) {
            Object.preventExtensions(this);
          }
        }, argumentsList, Target);
      }
    });
  };
  return isDecorator ? deco(pathOrTarget) : deco;
}
