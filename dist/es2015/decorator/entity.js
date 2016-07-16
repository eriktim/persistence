import { Config } from '../config';
import { EntityConfig } from '../entity-config';
import { EntityData } from '../entity-data';
import { EntityManager } from '../entity-manager';
import { Util } from '../util';

Symbol('originalData');

export function decorate(target, propertyKey, desc, getter = function () {}, setter = function () {}) {
  let descriptor = {
    enumerable: Util.is(desc.enumerable) ? desc.enumerable : true,
    configurable: Util.is(desc.configurable) ? desc.configurable : true,
    set: false && Util.is(desc.set) ? value => {
      setter(value);desc.set(value);
    } : setter,
    get: false && Util.is(desc.get) ? () => {
      desc.get();return getter();
    } : getter
  };
  let propertyDecorator = Config.getPropertyDecorator();
  return propertyDecorator ? propertyDecorator(target, propertyKey, descriptor) : descriptor;
}

export function Entity(pathOrTarget) {
  let isDecorator = Util.isClassDecorator(...arguments);
  let deco = function (Target) {
    let defaultPath = Target.name.toLowerCase();
    let path = isDecorator ? defaultPath : pathOrTarget || defaultPath;
    let config = EntityConfig.get(Target);
    config.configure({ path });
    const entitySkeleton = Reflect.construct(Target, []);
    Object.keys(entitySkeleton).forEach(propertyKey => {
      let propConfig = config.getProperty(propertyKey);
      if (propConfig && propConfig.transient) {
        return;
      }
      let descriptor = decorate(Target.prototype, propertyKey, {}, function () {
        return EntityData.getProperty(this, propertyKey);
      }, function (value) {
        return EntityData.setProperty(this, propertyKey, value);
      });
      Reflect.defineProperty(Target.prototype, propertyKey, descriptor);
    });
    return new Proxy(Target, {
      construct: function (target, argumentsList, newTarget) {
        return Reflect.construct(function (entityManager) {
          if (!(entityManager instanceof EntityManager)) {
            throw new Error(`Entity '${ Target.name }' must be created by an entityManager`);
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