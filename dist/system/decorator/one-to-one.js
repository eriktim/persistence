'use strict';

System.register(['../persistent-config', '../entity-manager', '../symbols', '../util'], function (_export, _context) {
  "use strict";

  var PersistentConfig, getUri, idFromUri, ENTITY_MANAGER, Util, _slicedToArray, referencesMap, SELF_REF;

  function getAndSetReferenceFactory(Type, getter, setter) {
    return [function (target, propertyKey) {
      if (Type === SELF_REF) {
        Type = Object.getPrototypeOf(target).constructor;
      }
      if (!referencesMap.has(target)) {
        referencesMap.set(target, new Map());
      }
      var references = referencesMap.get(target);
      var entityManager = target[ENTITY_MANAGER];
      return Promise.resolve().then(function () {
        if (!references.has(propertyKey)) {
          var uri = Reflect.apply(getter, target, []);
          var id = idFromUri(uri);
          if (id) {
            return entityManager.find(Type, id).then(function (entity) {
              return references.set(propertyKey, entity);
            });
          }
        }
      }).then(function () {
        return references.get(propertyKey);
      }).then(function (entity) {
        if (entity && !entityManager.contains(target) && entityManager.contains(entity)) {
          entityManager.detach(entity);
        }
        return entity;
      });
    }, function (target, propertyKey, entity) {
      if (Type === SELF_REF) {
        Type = Object.getPrototypeOf(target).constructor;
      }
      if (!(entity instanceof Type)) {
        throw new TypeError('invalid reference object');
      }
      var uri = getUri(entity);
      if (!uri) {
        throw new TypeError('bad reference object');
      }
      Reflect.apply(setter, target, [uri]);
      if (!referencesMap.has(target)) {
        referencesMap.set(target, new Map());
      }
      var references = referencesMap.get(target);
      references.set(propertyKey, entity);
    }];
  }

  function OneToOne(Type) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    if (Util.isPropertyDecorator.apply(Util, arguments) || Util.is(Type) && Type !== SELF_REF && !Util.isClass(Type)) {
      throw new Error('@OneToOne requires a constructor argument');
    }
    return function (target, propertyKey) {
      var config = PersistentConfig.get(target).getProperty(propertyKey);

      var _getAndSetReferenceFa = getAndSetReferenceFactory(Type, config.getter, config.setter);

      var _getAndSetReferenceFa2 = _slicedToArray(_getAndSetReferenceFa, 2);

      var getReference = _getAndSetReferenceFa2[0];
      var setReference = _getAndSetReferenceFa2[1];

      config.configure({
        getter: function getter() {
          return getReference(this, propertyKey);
        },
        setter: function setter(val) {
          setReference(this, propertyKey, val);
        }
      });
    };
  }

  _export('OneToOne', OneToOne);

  return {
    setters: [function (_persistentConfig) {
      PersistentConfig = _persistentConfig.PersistentConfig;
    }, function (_entityManager) {
      getUri = _entityManager.getUri;
      idFromUri = _entityManager.idFromUri;
    }, function (_symbols) {
      ENTITY_MANAGER = _symbols.ENTITY_MANAGER;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {
      _slicedToArray = function () {
        function sliceIterator(arr, i) {
          var _arr = [];
          var _n = true;
          var _d = false;
          var _e = undefined;

          try {
            for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
              _arr.push(_s.value);

              if (i && _arr.length === i) break;
            }
          } catch (err) {
            _d = true;
            _e = err;
          } finally {
            try {
              if (!_n && _i["return"]) _i["return"]();
            } finally {
              if (_d) throw _e;
            }
          }

          return _arr;
        }

        return function (arr, i) {
          if (Array.isArray(arr)) {
            return arr;
          } else if (Symbol.iterator in Object(arr)) {
            return sliceIterator(arr, i);
          } else {
            throw new TypeError("Invalid attempt to destructure non-iterable instance");
          }
        };
      }();

      referencesMap = new WeakMap();
      SELF_REF = 'self';
    }
  };
});