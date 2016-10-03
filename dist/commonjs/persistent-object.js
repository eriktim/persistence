'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PersistentObject = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _collection = require('./collection');

var _config = require('./config');

var _persistentConfig = require('./persistent-config');

var _persistentData = require('./persistent-data');

var _symbols = require('./symbols');

var _util = require('./util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var propertyDecorator = _config.Config.getPropertyDecorator();
var parentMap = new WeakMap();

function getEntity(obj) {
  if (_symbols.ENTITY_MANAGER in obj) {
    return obj;
  }
  var parent = parentMap.get(obj);
  if (parent) {
    return getEntity(parent);
  }
  throw new Error('object is not part of an entity');
}

var PersistentObject = exports.PersistentObject = function () {
  function PersistentObject() {
    _classCallCheck(this, PersistentObject);
  }

  _createClass(PersistentObject, null, [{
    key: 'byDecoration',
    value: function byDecoration(Target) {
      var config = _persistentConfig.PersistentConfig.get(Target);

      var instance = Reflect.construct(Target, []);
      Object.keys(instance).forEach(function (propertyKey) {
        var propConfig = config.getProperty(propertyKey);
        if (propConfig.type === _persistentConfig.PropertyType.TRANSIENT) {
          return;
        }
        var ownDescriptor = Object.getOwnPropertyDescriptor(Target.prototype, propertyKey) || {};
        var descriptor = _util.Util.mergeDescriptors(ownDescriptor, {
          get: propConfig.getter,
          set: propConfig.setter
        });
        var finalDescriptor = propertyDecorator ? propertyDecorator(Target.prototype, propertyKey, descriptor) : descriptor;
        Reflect.defineProperty(Target.prototype, propertyKey, finalDescriptor);
      });

      return new Proxy(Target, {
        construct: function construct(target, argumentsList) {
          return Reflect.construct(function () {
            var _this = this;

            _persistentData.PersistentData.inject(this, {});
            Object.keys(instance).forEach(function (propertyKey) {
              var propConfig = config.getProperty(propertyKey);
              if (propConfig.type === _persistentConfig.PropertyType.TRANSIENT && !Reflect.has(_this, propertyKey)) {
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
      var entityManager = entity[_symbols.ENTITY_MANAGER];
      var onNewObject = entityManager.config.onNewObject;
      if (typeof onNewObject === 'function') {
        Reflect.apply(onNewObject, null, [obj, entity]);
      }
      var isExtensible = obj === entity ? _persistentConfig.PersistentConfig.get(entity).isExtensible : Object.isExtensible(entity);
      if (!isExtensible) {
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