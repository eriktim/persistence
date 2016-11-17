'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PersistentObject = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.getEntity = getEntity;

var _collection = require('./collection');

var _config = require('./config');

var _entityManager = require('./entity-manager');

var _persistentConfig = require('./persistent-config');

var _persistentData = require('./persistent-data');

var _symbols = require('./symbols');

var _util = require('./util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CONSTRUCTOR = '__construct';

var transientFieldsMap = new WeakMap();
var propertyDecorator = _config.Config.getPropertyDecorator();

function getEntity(obj) {
  while (obj[_symbols.PARENT]) {
    obj = obj[_symbols.PARENT];
  }
  return _symbols.ENTITY_MANAGER in obj ? obj : null;
}

var PersistentObject = exports.PersistentObject = function () {
  function PersistentObject() {
    _classCallCheck(this, PersistentObject);
  }

  _createClass(PersistentObject, null, [{
    key: 'byDecoration',
    value: function byDecoration(Target) {
      var allowOwnConstructor = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (Target.isPersistent) {
        return undefined;
      }
      Target.isPersistent = true;

      var config = _persistentConfig.PersistentConfig.get(Target);

      var instance = Reflect.construct(Target, []);
      var transientFields = new Set(Object.keys(instance));
      for (var propertyKey in instance) {
        var propConfig = config.getProperty(propertyKey);
        if (propConfig.type === _persistentConfig.PropertyType.TRANSIENT) {
          continue;
        }
        transientFields.delete(propertyKey);
        var ownDescriptor = Object.getOwnPropertyDescriptor(Target.prototype, propertyKey) || {};
        var descriptor = _util.Util.mergeDescriptors(ownDescriptor, {
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
              PersistentObject.apply(this, {}, null);
              if (typeof this[CONSTRUCTOR] === 'function') {
                Reflect.apply(this[CONSTRUCTOR], this, argumentsList);
              }
            }, argumentsList, Target);
          }
        });
      }

      return new Proxy(Target, {
        construct: function construct(target, argumentsList) {
          return Reflect.construct(function (entityManager) {
            if (!(entityManager instanceof _entityManager.EntityManager)) {
              throw new Error('Use EntityManager#create to create new entities');
            }
            (0, _symbols.defineSymbol)(this, _symbols.ENTITY_MANAGER, { value: entityManager, writable: false });
            (0, _symbols.defineSymbol)(this, _symbols.RELATIONS, { value: new Set(), writable: false });
            (0, _symbols.defineSymbol)(this, _symbols.REMOVED, false);
          }, argumentsList, Target);
        }
      });
    }
  }, {
    key: 'apply',
    value: function apply(obj, data, parent) {
      (0, _symbols.defineSymbol)(obj, _symbols.PARENT, { value: parent, writable: false });
      PersistentObject.setData(obj, data);
      var entity = getEntity(obj);
      if (entity) {
        var entityManager = entity[_symbols.ENTITY_MANAGER];
        var onNewObject = entityManager.config.onNewObject;
        if (typeof onNewObject === 'function') {
          Reflect.apply(onNewObject, null, [obj, entity]);
        }
      }
      var isExtensible = obj === entity ? _persistentConfig.PersistentConfig.get(entity).isExtensible : Object.isExtensible(entity);
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
      _persistentData.PersistentData.inject(obj, data);
      var entityConfig = _persistentConfig.PersistentConfig.get(obj);
      var propertyMap = entityConfig.propertyMap;
      Object.keys(propertyMap).forEach(function (propertyKey) {
        var config = propertyMap[propertyKey];
        if (config.type === _persistentConfig.PropertyType.COLLECTION) {
          var propData = (0, _persistentData.readValue)(data, config.fullPath);
          propData && (0, _collection.setCollectionData)(obj[propertyKey], propData);
        } else if (config.type === _persistentConfig.PropertyType.EMBEDDED) {
          var _propData = (0, _persistentData.readValue)(data, config.fullPath);
          _propData && PersistentObject.setData(obj[propertyKey], _propData);
        }
      });
    }
  }]);

  return PersistentObject;
}();