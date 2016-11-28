'use strict';

System.register(['./collection', './config', './entity-manager', './persistent-config', './persistent-data', './symbols', './util'], function (_export, _context) {
  "use strict";

  var setCollectionData, Config, EntityManager, PersistentConfig, PropertyType, PersistentData, readValue, defineSymbol, ENTITY_MANAGER, PARENT, RELATIONS, REMOVED, Util, _createClass, transientFieldsMap, propertyDecorator, PersistentObject;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function getEntity(obj) {
    while (obj[PARENT]) {
      obj = obj[PARENT];
    }
    return ENTITY_MANAGER in obj ? obj : null;
  }

  _export('getEntity', getEntity);

  return {
    setters: [function (_collection) {
      setCollectionData = _collection.setCollectionData;
    }, function (_config) {
      Config = _config.Config;
    }, function (_entityManager) {
      EntityManager = _entityManager.EntityManager;
    }, function (_persistentConfig) {
      PersistentConfig = _persistentConfig.PersistentConfig;
      PropertyType = _persistentConfig.PropertyType;
    }, function (_persistentData) {
      PersistentData = _persistentData.PersistentData;
      readValue = _persistentData.readValue;
    }, function (_symbols) {
      defineSymbol = _symbols.defineSymbol;
      ENTITY_MANAGER = _symbols.ENTITY_MANAGER;
      PARENT = _symbols.PARENT;
      RELATIONS = _symbols.RELATIONS;
      REMOVED = _symbols.REMOVED;
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

      transientFieldsMap = new WeakMap();
      propertyDecorator = Config.getPropertyDecorator();

      _export('PersistentObject', PersistentObject = function () {
        function PersistentObject() {
          _classCallCheck(this, PersistentObject);
        }

        _createClass(PersistentObject, null, [{
          key: 'byDecoration',
          value: function byDecoration(Target) {
            var allowOwnConstructor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            if (Target.hasOwnProperty('isPersistent')) {
              return undefined;
            }
            Target.isPersistent = true;

            var config = PersistentConfig.get(Target);
            var transientFields = new Set();
            for (var propertyKey in config.propertyMap) {
              var propConfig = config.getProperty(propertyKey);
              if (propConfig.type === PropertyType.TRANSIENT) {
                transientFields.add(propertyKey);
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
            transientFieldsMap.set(Target, transientFields);

            if (allowOwnConstructor) {
              return new Proxy(Target, {
                construct: function construct(target, argumentsList) {
                  return Reflect.construct(function () {
                    var data = argumentsList.length === 1 ? argumentsList[0] : {};
                    PersistentObject.apply(this, data, null);
                  }, argumentsList, Target);
                }
              });
            }

            return new Proxy(Target, {
              construct: function construct(target, argumentsList) {
                return Reflect.construct(function (entityManager) {
                  if (!(entityManager instanceof EntityManager)) {
                    throw new Error('Use EntityManager#create to create new entities');
                  }
                  defineSymbol(this, ENTITY_MANAGER, { value: entityManager, writable: false });
                  defineSymbol(this, RELATIONS, { value: new Set(), writable: false });
                  defineSymbol(this, REMOVED, false);
                }, argumentsList, Target);
              }
            });
          }
        }, {
          key: 'apply',
          value: function apply(obj, data, parent) {
            defineSymbol(obj, PARENT, { value: parent, writable: false });
            PersistentObject.setData(obj, data);
            var entity = getEntity(obj);
            if (entity) {
              var entityManager = entity[ENTITY_MANAGER];
              var onNewObject = entityManager.config.onNewObject;
              if (typeof onNewObject === 'function') {
                Reflect.apply(onNewObject, null, [obj, entity]);
              }
            }
            var isExtensible = obj === entity ? PersistentConfig.get(entity).isExtensible : Object.isExtensible(entity);
            if (!isExtensible) {
              var Target = Object.getPrototypeOf(obj).constructor;
              var transientFields = transientFieldsMap.get(Target);
              if (transientFields && transientFields.size) {
                transientFields.forEach(function (propertyKey) {
                  if (!obj.hasOwnProperty(propertyKey)) {
                    obj[propertyKey] = undefined;
                  }
                });
              }
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