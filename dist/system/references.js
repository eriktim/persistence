'use strict';

System.register(['./entity-manager', './persistent-object', './symbols'], function (_export, _context) {
  "use strict";

  var getUri, idFromUri, setUnresolvedRelation, getEntity, ENTITY_MANAGER, RELATIONS, VERSION, _createClass, _get, configMap, referenceMap, promiseMap, References, ReferencesFactory;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  function _extendableBuiltin(cls) {
    function ExtendableBuiltin() {
      var instance = Reflect.construct(cls, Array.from(arguments));
      Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
      return instance;
    }

    ExtendableBuiltin.prototype = Object.create(cls.prototype, {
      constructor: {
        value: cls,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });

    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(ExtendableBuiltin, cls);
    } else {
      ExtendableBuiltin.__proto__ = cls;
    }

    return ExtendableBuiltin;
  }

  function getRelationMap(obj) {
    var entity = getEntity(obj);
    return entity ? entity[RELATIONS] : undefined;
  }

  function loadReferencesData(references, array) {
    var config = configMap.get(references);
    config.silent = true;
    if (config.array) {
      if (config.array === array) {
        return;
      }
      references.clear();
    }
    config.array = array;
    var entityManager = config.target[ENTITY_MANAGER];
    var promises = array.splice(0, array.length).map(function (data) {
      var uri = entityManager.config.referenceToUri(data);
      var id = idFromUri(uri);
      if (id) {
        return entityManager.find(config.Type, id).then(function (entity) {
          references.add(entity);
          return entity;
        });
      }
    });
    var p = Promise.all(promises).then(function (entities) {
      config.silent = false;
      if (!entityManager.contains(config.target)) {
        entities.forEach(function (entity) {
          if (entity && entityManager.contains(entity)) {
            entityManager.detach(entity);
          }
        });
      }
    });
    promiseMap.set(references, p);
  }

  _export('loadReferencesData', loadReferencesData);

  function versionUp(target) {
    if (target) {
      target[VERSION]++;
    }
  }

  return {
    setters: [function (_entityManager) {
      getUri = _entityManager.getUri;
      idFromUri = _entityManager.idFromUri;
      setUnresolvedRelation = _entityManager.setUnresolvedRelation;
    }, function (_persistentObject) {
      getEntity = _persistentObject.getEntity;
    }, function (_symbols) {
      ENTITY_MANAGER = _symbols.ENTITY_MANAGER;
      RELATIONS = _symbols.RELATIONS;
      VERSION = _symbols.VERSION;
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

      _get = function get(object, property, receiver) {
        if (object === null) object = Function.prototype;
        var desc = Object.getOwnPropertyDescriptor(object, property);

        if (desc === undefined) {
          var parent = Object.getPrototypeOf(object);

          if (parent === null) {
            return undefined;
          } else {
            return get(parent, property, receiver);
          }
        } else if ("value" in desc) {
          return desc.value;
        } else {
          var getter = desc.get;

          if (getter === undefined) {
            return undefined;
          }

          return getter.call(receiver);
        }
      };

      configMap = new WeakMap();
      referenceMap = new WeakMap();
      promiseMap = new WeakMap();

      References = function (_extendableBuiltin2) {
        _inherits(References, _extendableBuiltin2);

        function References() {
          _classCallCheck(this, References);

          return _possibleConstructorReturn(this, (References.__proto__ || Object.getPrototypeOf(References)).apply(this, arguments));
        }

        _createClass(References, [{
          key: 'add',
          value: function add(item) {
            if (!item || this.has(item)) {
              return this;
            }
            var config = configMap.get(this);
            if (!(item instanceof config.Type)) {
              throw new TypeError('invalid reference object');
            }
            _get(References.prototype.__proto__ || Object.getPrototypeOf(References.prototype), 'add', this).call(this, item);
            var entityManager = config.target[ENTITY_MANAGER];
            var setUri = function setUri(uri) {
              var reference = entityManager.config.uriToReference(uri);
              referenceMap.set(item, reference);
              config.array.push(reference);
            };
            var uri = getUri(item);
            if (uri) {
              setUri(uri);
            } else {
              setUnresolvedRelation(config.target, item, setUri);
            }
            getRelationMap(config.target).add(item);
            if (!config.silent) {
              versionUp(config.target);
            }
            return this;
          }
        }, {
          key: 'clear',
          value: function clear() {
            var config = configMap.get(this);
            config.array.splice(0, config.array.length);
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = this[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var item = _step.value;

                getRelationMap(config.target).delete(item);
                setUnresolvedRelation(config.target, item, null);
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }

            _get(References.prototype.__proto__ || Object.getPrototypeOf(References.prototype), 'clear', this).call(this);
            if (!config.silent) {
              versionUp(config.target);
            }
          }
        }, {
          key: 'delete',
          value: function _delete(item) {
            var config = configMap.get(this);
            var data = referenceMap.get(item);
            var index = config.array.indexOf(data);
            if (index) {
              config.array.splice(index, 1);
            }
            getRelationMap(config.target).delete(item);
            setUnresolvedRelation(config.target, item, null);
            var deleted = _get(References.prototype.__proto__ || Object.getPrototypeOf(References.prototype), 'delete', this).call(this, item);
            if (!config.silent) {
              versionUp(config.target);
            }
            return deleted;
          }
        }, {
          key: 'then',
          value: function then(fn) {
            var _this2 = this;

            return promiseMap.get(this).then(function () {
              return fn(Array.from(_this2));
            });
          }
        }]);

        return References;
      }(_extendableBuiltin(Set));

      _export('ReferencesFactory', ReferencesFactory = function () {
        function ReferencesFactory() {
          _classCallCheck(this, ReferencesFactory);
        }

        _createClass(ReferencesFactory, null, [{
          key: 'create',
          value: function create(Type, array, target) {
            var references = new References();
            configMap.set(references, {
              Type: Type,
              silent: false,
              target: target
            });
            loadReferencesData(references, array);
            return references;
          }
        }]);

        return ReferencesFactory;
      }());

      _export('ReferencesFactory', ReferencesFactory);
    }
  };
});