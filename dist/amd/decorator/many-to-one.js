define(['exports', '../persistent-config', '../references', '../util'], function (exports, _persistentConfig, _references, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.ManyToOne = ManyToOne;


  var referencesMap = new WeakMap();
  var SELF_REF = 'self';

  function getReferencesFactory(Type, getter, setter) {
    return function (target, propertyKey) {
      if (!referencesMap.has(target)) {
        referencesMap.set(target, new Map());
      }
      var references = referencesMap.get(target);
      if (!references.has(propertyKey)) {
        var data = Reflect.apply(getter, target, []);
        if (data === undefined) {
          data = [];
          Reflect.apply(setter, target, [data]);
        }
        if (!Array.isArray(data)) {
          throw new Error('references data is corrupt');
        }
        var setOfReferences = _references.ReferencesFactory.create(Type, data, target);
        references.set(propertyKey, setOfReferences);
      }
      return references.get(propertyKey);
    };
  }

  function ManyToOne(Type) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (_util.Util.isPropertyDecorator.apply(_util.Util, arguments) || _util.Util.is(Type) && Type !== SELF_REF && !_util.Util.isClass(Type)) {
      throw new Error('@ManyToOne requires a constructor argument');
    }
    return function (target, propertyKey) {
      var config = _persistentConfig.PersistentConfig.get(target).getProperty(propertyKey);
      var getReferences = getReferencesFactory(Type, config.getter, config.setter);
      config.configure({
        getter: function getter() {
          return getReferences(this, propertyKey);
        },
        setter: function setter(val) {
          throw new Error('cannot override set of references');
        }
      });
    };
  }
});