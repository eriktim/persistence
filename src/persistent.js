import {Config} from './config';
import {EntityConfig} from './entity-config';
import {PersistentData} from './persistent-data';
import {Util} from './util';

const propertyDecorator = Config.getPropertyDecorator();

export class Persistent {
  static decorate(Target, onConstruct = null) {
    const config = EntityConfig.get(Target);

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
        return Reflect.construct(function(...args) {
          PersistentData.inject(this, {});
          Object.keys(instance).forEach(propertyKey => {
            const propConfig = config.getProperty(propertyKey);
            if (propConfig.transient && !Reflect.has(this, propertyKey)) {
              this[propertyKey] = undefined;
            }
          });
          if (typeof onConstruct === 'function') {
            Reflect.apply(onConstruct, this, args);
          }
        }, argumentsList, Target);
      }
    });
  }
}
