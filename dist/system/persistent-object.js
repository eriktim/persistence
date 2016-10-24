'use strict';

System.register(['./collection', './config', './persistent-config', './persistent-data', './symbols', './util'], function (_export, _context) {
  "use strict";

  var setCollectionData, Config, PersistentConfig, PropertyType, PersistentData, readValue, ENTITY_MANAGER, Util, _createClass, propertyDecorator, parentMap, PersistentObject;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function getEntity(obj) {
    if (ENTITY_MANAGER in obj) {
      return obj;
    }
    var parent = parentMap.get(obj);
    if (parent) {
      return getEntity(parent);
    }
    throw new Error('object is not part of an entity');
  }

  return {
    setters: [function (_collection) {
      setCollectionData = _collection.setCollectionData;
    }, function (_config) {
      Config = _config.Config;
    }, function (_persistentConfig) {
      PersistentConfig = _persistentConfig.PersistentConfig;
      PropertyType = _persistentConfig.PropertyType;
    }, function (_persistentData) {
      PersistentData = _persistentData.PersistentData;
      readValue = _persistentData.readValue;
    }, function (_symbols) {
      ENTITY_MANAGER = _symbols.ENTITY_MANAGER;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      propertyDecorator = Config.getPropertyDecorator();
      parentMap = new WeakMap();

      _export('PersistentObject', PersistentObject = function () {
        function PersistentObject() {
          _classCallCheck(this, PersistentObject);
        }

        _createClass(PersistentObject, null, [{
          key: 'byDecoration',
          value: function byDecoration(Target) {
            Target.isPersistent = true;

            var config = PersistentConfig.get(Target);

            var instance = Reflect.construct(Target, []);
            for (var propertyKey in instance) {
              var propConfig = config.getProperty(propertyKey);
              if (propConfig.type === PropertyType.TRANSIENT) {
                continue;
              }
              var ownDescriptor = Object.getOwnPropertyDescriptor(Target.prototype, propertyKey) || {};
              var descriptor = Util.mergeDescriptors(ownDescriptor, {
                get: propConfig.getter,
                set: propConfig.setter
              });
              var finalDescriptor = propertyDecorator ? propertyDecorator(Target.prototype, propertyKey, descriptor) : descriptor;
              Reflect.defineProperty(Target.prototype, propertyKey, finalDescriptor);
            }

            return new Proxy(Target, {
              construct: function construct(target, argumentsList) {
                return Reflect.construct(function () {
                  var _this = this;

                  PersistentData.inject(this, {});
                  Object.keys(instance).forEach(function (propertyKey) {
                    var propConfig = config.getProperty(propertyKey);
                    if (propConfig.type === PropertyType.TRANSIENT && !Reflect.has(_this, propertyKey)) {
                      _this[propertyKey] = undefined;
                    }
                  });
                }, argumentsList, Target);
              }
            });
          }
        }, {
          key: 'apply',
          value: function apply(obj, data, parent) {
            parentMap.set(obj, parent);
            PersistentObject.setData(obj, data);
            var entity = getEntity(obj);
            var entityManager = entity[ENTITY_MANAGER];
            var onNewObject = entityManager.config.onNewObject;
            if (typeof onNewObject === 'function') {
              Reflect.apply(onNewObject, null, [obj, entity]);
            }
            var isExtensible = obj === entity ? PersistentConfig.get(entity).isExtensible : Object.isExtensible(entity);
            if (!isExtensible) {
              Object.preventExtensions(obj);
            }
          }
        }, {
          key: 'setData',
          value: function setData(obj, data) {
            PersistentData.inject(obj, data);
            var entityConfig = PersistentConfig.get(obj);
            var propertyMap = entityConfig.propertyMap;
            Object.keys(propertyMap).forEach(function (propertyKey) {
              var config = propertyMap[propertyKey];
              if (config.type === PropertyType.COLLECTION) {
                var propData = readValue(data, config.fullPath);
                propData && setCollectionData(obj[propertyKey], propData);
              } else if (config.type === PropertyType.EMBEDDED) {
                var _propData = readValue(data, config.fullPath);
                _propData && PersistentObject.setData(obj[propertyKey], _propData);
              }
            });
          }
        }]);

        return PersistentObject;
      }());

      _export('PersistentObject', PersistentObject);
    }
  };
});