'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decorate = decorate;
exports.Entity = Entity;

var _config = require('../config');

var _entityConfig = require('../entity-config');

var _entityData = require('../entity-data');

var _entityManager = require('../entity-manager');

var _util = require('../util');

Symbol('originalData');

function decorate(target, propertyKey, desc) {
  var getter = arguments.length <= 3 || arguments[3] === undefined ? function () {} : arguments[3];
  var setter = arguments.length <= 4 || arguments[4] === undefined ? function () {} : arguments[4];

  var descriptor = {
    enumerable: _util.Util.is(desc.enumerable) ? desc.enumerable : true,
    configurable: _util.Util.is(desc.configurable) ? desc.configurable : true,
    set: false && _util.Util.is(desc.set) ? function (value) {
      setter(value);desc.set(value);
    } : setter,
    get: false && _util.Util.is(desc.get) ? function () {
      desc.get();return getter();
    } : getter
  };
  var propertyDecorator = _config.Config.getPropertyDecorator();
  return propertyDecorator ? propertyDecorator(target, propertyKey, descriptor) : descriptor;
}

function Entity(pathOrTarget) {
  var isDecorator = _util.Util.isClassDecorator.apply(_util.Util, arguments);
  var deco = function deco(Target) {
    var defaultPath = Target.name.toLowerCase();
    var path = isDecorator ? defaultPath : pathOrTarget || defaultPath;
    var config = _entityConfig.EntityConfig.get(Target);
    config.configure({ path: path });
    var entitySkeleton = Reflect.construct(Target, []);
    Object.keys(entitySkeleton).forEach(function (propertyKey) {
      var propConfig = config.getProperty(propertyKey);
      if (propConfig && propConfig.transient) {
        return;
      }
      var descriptor = decorate(Target.prototype, propertyKey, {}, function () {
        return _entityData.EntityData.getProperty(this, propertyKey);
      }, function (value) {
        return _entityData.EntityData.setProperty(this, propertyKey, value);
      });
      Reflect.defineProperty(Target.prototype, propertyKey, descriptor);
    });
    return new Proxy(Target, {
      construct: function construct(target, argumentsList, newTarget) {
        return Reflect.construct(function (entityManager) {
          if (!(entityManager instanceof _entityManager.EntityManager)) {
            throw new Error('Entity \'' + Target.name + '\' must be created by an entityManager');
          }
          _entityData.EntityData.inject(this, {});
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