'use strict';

System.register(['../persistent-config', '../references', '../util'], function (_export, _context) {
  "use strict";

  var PersistentConfig, ReferencesFactory, Util, referencesMap, SELF_REF;


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
        var setOfReferences = ReferencesFactory.create(Type, data, target);
        references.set(propertyKey, setOfReferences);
      }
      return references.get(propertyKey);
    };
  }

  function ManyToOne(Type) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (Util.isPropertyDecorator.apply(Util, arguments) || Util.is(Type) && Type !== SELF_REF && !Util.isClass(Type)) {
      throw new Error('@ManyToOne requires a constructor argument');
    }
    return function (target, propertyKey) {
      var config = PersistentConfig.get(target).getProperty(propertyKey);
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

  _export('ManyToOne', ManyToOne);

  return {
    setters: [function (_persistentConfig) {
      PersistentConfig = _persistentConfig.PersistentConfig;
    }, function (_references) {
      ReferencesFactory = _references.ReferencesFactory;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {
      referencesMap = new WeakMap();
      SELF_REF = 'self';
    }
  };
});