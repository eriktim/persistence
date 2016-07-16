'use strict';

System.register(['../config', '../entity-config', '../entity-data', '../entity-manager', '../util'], function (_export, _context) {
  var Config, EntityConfig, EntityData, EntityManager, Util;
  return {
    setters: [function (_config) {
      Config = _config.Config;
    }, function (_entityConfig) {
      EntityConfig = _entityConfig.EntityConfig;
    }, function (_entityData) {
      EntityData = _entityData.EntityData;
    }, function (_entityManager) {
      EntityManager = _entityManager.EntityManager;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {

      Symbol('originalData');

      function decorate(target, propertyKey, desc) {
        var getter = arguments.length <= 3 || arguments[3] === undefined ? function () {} : arguments[3];
        var setter = arguments.length <= 4 || arguments[4] === undefined ? function () {} : arguments[4];

        var descriptor = {
          enumerable: Util.is(desc.enumerable) ? desc.enumerable : true,
          configurable: Util.is(desc.configurable) ? desc.configurable : true,
          set: false && Util.is(desc.set) ? function (value) {
            setter(value);desc.set(value);
          } : setter,
          get: false && Util.is(desc.get) ? function () {
            desc.get();return getter();
          } : getter
        };
        var propertyDecorator = Config.getPropertyDecorator();
        return propertyDecorator ? propertyDecorator(target, propertyKey, descriptor) : descriptor;
      }

      _export('decorate', decorate);

      function Entity(pathOrTarget) {
        var isDecorator = Util.isClassDecorator.apply(Util, arguments);
        var deco = function deco(Target) {
          var defaultPath = Target.name.toLowerCase();
          var path = isDecorator ? defaultPath : pathOrTarget || defaultPath;
          var config = EntityConfig.get(Target);
          config.configure({ path: path });
          var entitySkeleton = Reflect.construct(Target, []);
          Object.keys(entitySkeleton).forEach(function (propertyKey) {
            var propConfig = config.getProperty(propertyKey);
            if (propConfig && propConfig.transient) {
              return;
            }
            var descriptor = decorate(Target.prototype, propertyKey, {}, function () {
              return EntityData.getProperty(this, propertyKey);
            }, function (value) {
              return EntityData.setProperty(this, propertyKey, value);
            });
            Reflect.defineProperty(Target.prototype, propertyKey, descriptor);
          });
          return new Proxy(Target, {
            construct: function construct(target, argumentsList, newTarget) {
              return Reflect.construct(function (entityManager) {
                if (!(entityManager instanceof EntityManager)) {
                  throw new Error('Entity \'' + Target.name + '\' must be created by an entityManager');
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

      _export('Entity', Entity);
    }
  };
});