define(['exports', './embeddable', '../persistent-config', '../persistent-object', '../util'], function (exports, _embeddable, _persistentConfig, _persistentObject, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.Embedded = Embedded;


  var embeddedDataMap = new WeakMap();

  function getEmbeddedDataFactory(Type, getter, setter) {
    return function (target, propertyKey) {
      if (!embeddedDataMap.has(target)) {
        embeddedDataMap.set(target, new Map());
      }
      var embeddedData = embeddedDataMap.get(target);
      if (!embeddedData.has(propertyKey)) {
        var data = Reflect.apply(getter, target, []);
        if (data === undefined) {
          data = {};
          Reflect.apply(setter, target, [data]);
        }
        if (!_util.Util.isObject(data)) {
          throw new Error('embedded data is corrupt');
        }
        var type = new Type();
        _persistentObject.PersistentObject.apply(type, data, target);
        embeddedData.set(propertyKey, type);
      }
      return embeddedData.get(propertyKey);
    };
  }

  function Embedded(Type) {
    var isDecorator = _util.Util.isPropertyDecorator.apply(_util.Util, arguments);
    if (isDecorator) {
      throw new Error('@Embedded requires a type');
    }
    if (!(0, _embeddable.isEmbeddable)(Type)) {
      throw new TypeError('embedded object is not embeddable');
    }
    return function (target, propertyKey) {
      var config = _persistentConfig.PersistentConfig.get(target).getProperty(propertyKey);
      var getEmbeddedData = getEmbeddedDataFactory(Type, config.getter, config.setter);
      config.configure({
        type: _persistentConfig.PropertyType.EMBEDDED,
        getter: function getter() {
          return getEmbeddedData(this, propertyKey);
        },
        setter: function setter() {
          throw new Error('cannot override embedded object');
        }
      });
    };
  }
});