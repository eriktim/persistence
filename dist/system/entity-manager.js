'use strict';

System.register(['./config', './persistent-config', './persistent-data', './persistent-object', './symbols', './util'], function (_export, _context) {
  "use strict";

  var Config, PersistentConfig, PersistentData, PersistentObject, RELATIONS, REMOVED, Util, _slicedToArray, _typeof, _createClass, LOCATION, serverMap, contextMap, cacheMap, unresolvedRelationsMap, EntityManager, Server;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function getLocationSymbolForTesting() {
    return LOCATION;
  }

  _export('getLocationSymbolForTesting', getLocationSymbolForTesting);

  function getServerForTesting(entityManager) {
    return serverMap.get(entityManager);
  }

  _export('getServerForTesting', getServerForTesting);

  function getUri(entity) {
    var parts = [getPath(entity), getId(entity)].filter(function (v) {
      return v;
    });
    return parts.length === 2 ? parts.join('/') : undefined;
  }

  _export('getUri', getUri);

  function idFromUri(uri) {
    return uri ? uri.split('?')[0].split('/').pop() : undefined;
  }

  _export('idFromUri', idFromUri);

  function setUnresolvedRelation(entity, relatedEntity, setUri) {
    if (!unresolvedRelationsMap.has(entity)) {
      unresolvedRelationsMap.set(entity, new Map());
    }
    var unresolvedEntityRelationsMap = unresolvedRelationsMap.get(entity);
    if (setUri) {
      unresolvedEntityRelationsMap.set(relatedEntity, setUri);
    } else {
      unresolvedEntityRelationsMap.delete(relatedEntity);
    }
  }

  _export('setUnresolvedRelation', setUnresolvedRelation);

  function applySafe(fn, thisObj) {
    var args = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];

    return fn ? Reflect.apply(fn, thisObj, args) : undefined;
  }

  function assertEntity(entityManager, entity) {
    if (!entityManager.contains(entity)) {
      throw new TypeError('argument is not a persistent entity');
    }
  }

  function attach(entityManager, entity) {
    contextMap.get(entityManager).add(entity);
  }

  function cachedEntity(entity, cache, uri) {
    cache.set(uri, entity);
    return entity;
  }

  function getId(entity) {
    var config = PersistentConfig.get(entity);
    var idKey = config.idKey;
    if (!idKey) {
      throw new Error('Entity has no primary key');
    }
    return entity[idKey];
  }

  function hasId(entity) {
    var config = PersistentConfig.get(entity);
    return !!config.idKey;
  }

  function getPath(entityOrEntity) {
    var Entity = Util.getClass(entityOrEntity);
    var path = PersistentConfig.get(Entity).path;
    if (!path) {
      throw new Error('object is not a valid Entity');
    }
    return path;
  }

  function toParams() {
    for (var _len = arguments.length, maps = Array(_len), _key = 0; _key < _len; _key++) {
      maps[_key] = arguments[_key];
    }

    var flatMap = maps.map(function (map) {
      if (!Util.is(map)) {
        return {};
      }
      if (!Util.isObject(map)) {
        throw new TypeError('argument should be an \'object\'');
      }
      return map;
    }).reduce(function (flat, map) {
      return Object.assign(flat, map);
    }, {});

    var params = Object.keys(flatMap).map(function (key) {
      return encodeURIComponent(key) + '=' + encodeURIComponent(flatMap[key]);
    }).join('&');
    return params.length ? '?' + params : '';
  }

  return {
    setters: [function (_config) {
      Config = _config.Config;
    }, function (_persistentConfig) {
      PersistentConfig = _persistentConfig.PersistentConfig;
    }, function (_persistentData) {
      PersistentData = _persistentData.PersistentData;
    }, function (_persistentObject) {
      PersistentObject = _persistentObject.PersistentObject;
    }, function (_symbols) {
      RELATIONS = _symbols.RELATIONS;
      REMOVED = _symbols.REMOVED;
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

      _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };

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

      LOCATION = Symbol('location');
      serverMap = new WeakMap();
      contextMap = new WeakMap();
      cacheMap = new WeakMap();
      unresolvedRelationsMap = new WeakMap();

      _export('EntityManager', EntityManager = function () {
        function EntityManager() {
          var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

          _classCallCheck(this, EntityManager);

          config = config || Config.getDefault();
          if (!(config instanceof Config)) {
            throw new Error('EntityManager requires a Config');
          }
          this.config = config.current;
          serverMap.set(this, new Server(this.config));
          this.clear();
        }

        _createClass(EntityManager, [{
          key: 'clear',
          value: function clear() {
            contextMap.set(this, new WeakSet());
            cacheMap.set(this, new Map());
          }
        }, {
          key: 'contains',
          value: function contains(entity) {
            return contextMap.get(this).has(entity);
          }
        }, {
          key: 'create',
          value: function create(Target) {
            var _this = this;

            var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return Promise.resolve().then(function () {
              var config = PersistentConfig.get(Target);
              if (!config || !config.path) {
                throw new Error('EntityManager expects a valid Entity');
              }
              if (!Util.isObject(data)) {
                return null;
              }
              var entity = new Target(_this);
              return Promise.resolve().then(function () {
                return PersistentObject.apply(entity, data);
              }).then(function () {
                return config.nonPersistent || attach(_this, entity);
              }).then(function () {
                return applySafe(config.postLoad, entity);
              }).then(function () {
                return entity;
              });
            });
          }
        }, {
          key: 'detach',
          value: function detach(entity) {
            cacheMap.get(this).delete(getUri(entity));
            return contextMap.get(this).delete(entity);
          }
        }, {
          key: 'find',
          value: function find(Entity, id) {
            var _this2 = this;

            return Promise.resolve().then(function () {
              if (typeof id !== 'string' && typeof id !== 'number') {
                throw new TypeError('id must be a \'string\' or \'number\', not \'' + (typeof id === 'undefined' ? 'undefined' : _typeof(id)) + '\'');
              }
              var path = getPath(Entity);
              var uri = path + '/' + id;
              var cache = cacheMap.get(_this2);
              return cache.get(uri) || serverMap.get(_this2).get(uri).then(function (data) {
                return _this2.create(Entity, data);
              }).then(function (entity) {
                return cachedEntity(entity, cache, uri);
              });
            });
          }
        }, {
          key: 'query',
          value: function query(Entity) {
            var _this3 = this;

            var stringOrPropertyMap = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return Promise.resolve().then(function () {
              var entityMapper = _this3.config.queryEntityMapperFactory(Entity);
              var path = getPath(Entity);
              var cache = cacheMap.get(_this3);
              return serverMap.get(_this3).get(path, stringOrPropertyMap).then(entityMapper).then(function (map) {
                if (!(map instanceof Map)) {
                  throw new Error('entityMapper must return a Map');
                }
                var entries = Array.from(map.entries());
                return Promise.all(entries.map(function (entry) {
                  return _this3.create(entry[1], entry[0]);
                }));
              }).then(function (entities) {
                return entities.map(function (entity) {
                  if (!hasId(entity)) {
                    return entity;
                  }
                  var uri = getUri(entity);
                  return cache.get(uri) || cachedEntity(entity, cache, uri);
                });
              });
            });
          }
        }, {
          key: 'persist',
          value: function persist(entity) {
            var _this4 = this;

            return Promise.resolve().then(function () {
              assertEntity(_this4, entity);

              return Promise.all(Array.from(entity[RELATIONS]).map(function (e) {
                return _this4.persist(e);
              }));
            }).then(function () {
              if (unresolvedRelationsMap.has(entity)) {
                var entries = unresolvedRelationsMap.get(entity).entries();
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                  for (var _iterator = entries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _step$value = _slicedToArray(_step.value, 2),
                        relation = _step$value[0],
                        setUri = _step$value[1];

                    var uri = getUri(relation);
                    setUri(uri);
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

                unresolvedRelationsMap.delete(entity);
              }
            }).then(function () {
              var id = getId(entity);
              var noId = !id;
              if (noId || PersistentData.isDirty(entity)) {
                var _ret = function () {
                  var server = serverMap.get(_this4);
                  var fetch = noId ? server.post : server.put;
                  var path = getPath(entity);
                  var config = PersistentConfig.get(entity);
                  var data = PersistentData.extract(entity);
                  return {
                    v: Promise.resolve().then(function () {
                      return applySafe(config.prePersist, entity);
                    }).then(function () {
                      return Reflect.apply(fetch, server, [noId ? path : path + '/' + id, data]);
                    }).then(function (raw) {
                      if (noId) {
                        var location = raw[LOCATION];
                        if (!location) {
                          throw new Error('REST server should return' + ' the location of the new entity');
                        }
                        var idPath = location.substring(location.lastIndexOf(path) + path.length + 1);

                        var index = idPath.indexOf('/');
                        var newId = index > 0 ? idPath.substring(0, index) : idPath;
                        PersistentData.setProperty(entity, config.idKey, newId);
                        PersistentData.setNotDirty(entity);
                        var cache = cacheMap.get(_this4);
                        var uri = getUri(entity);
                        cachedEntity(entity, cache, uri);
                      }
                    }).then(function () {
                      return attach(_this4, entity);
                    }).then(function () {
                      return applySafe(config.postPersist, entity);
                    })
                  };
                }();

                if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
              }
            }).then(function () {
              return entity;
            });
          }
        }, {
          key: 'refresh',
          value: function refresh(entity) {
            var _this5 = this;

            var reload = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

            return Promise.resolve().then(function () {
              assertEntity(_this5, entity);
              var id = getId(entity);
              return _this5.find(Util.getClass(entity), id).then(function (newEntity) {
                var data = PersistentData.extract(newEntity);
                PersistentObject.setData(entity, data);
                return entity;
              });
            });
          }
        }, {
          key: 'remove',
          value: function remove(entity) {
            var _this6 = this;

            return Promise.resolve().then(function () {
              assertEntity(_this6, entity);
              var id = getId(entity);
              var path = getPath(entity);
              var config = PersistentConfig.get(entity);
              return Promise.resolve().then(function () {
                return applySafe(config.preRemove, entity);
              }).then(function () {
                return id ? serverMap.get(_this6).delete(path + '/' + id) : undefined;
              }).then(function () {
                return entity[REMOVED] = true;
              }).then(function () {
                return applySafe(config.postRemove, entity);
              }).then(function () {
                return _this6.detach(entity);
              }).then(function () {
                return entity;
              });
            });
          }
        }]);

        return EntityManager;
      }());

      _export('EntityManager', EntityManager);

      Server = function () {
        function Server(config) {
          _classCallCheck(this, Server);

          this.baseUrl = (config.baseUrl || '').replace(/\/$/, '');
          this.fetchInterceptor = config.fetchInterceptor;
        }

        _createClass(Server, [{
          key: 'delete',
          value: function _delete(path) {
            return this.fetch(path, {
              method: 'DELETE'
            });
          }
        }, {
          key: 'get',
          value: function get(path) {
            var stringOrPropertyMap = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return this.fetch(path, {
              method: 'GET'
            }, stringOrPropertyMap);
          }
        }, {
          key: 'post',
          value: function post(path, data) {
            return this.fetch(path, {
              method: 'POST',
              body: JSON.stringify(data)
            });
          }
        }, {
          key: 'put',
          value: function put(path, data) {
            return this.fetch(path, {
              method: 'PUT',
              body: JSON.stringify(data)
            });
          }
        }, {
          key: 'fetch',
          value: function (_fetch) {
            function fetch(_x6, _x7) {
              return _fetch.apply(this, arguments);
            }

            fetch.toString = function () {
              return _fetch.toString();
            };

            return fetch;
          }(function (uri, init) {
            var _this7 = this;

            var stringOrPropertyMap = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

            var params = typeof stringOrPropertyMap === 'string' ? '?' + stringOrPropertyMap : toParams(stringOrPropertyMap);
            var url = this.baseUrl + '/' + uri + params;
            init.headers = new Headers({
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            });
            return Promise.resolve().then(function () {
              if (typeof _this7.fetchInterceptor === 'function') {
                return _this7.fetchInterceptor(url, init);
              }
              return new Request(url, init);
            }).then(function (requestResponseOrData) {
              return requestResponseOrData instanceof Request ? fetch(requestResponseOrData) : requestResponseOrData;
            }).then(function (responseOrData) {
              if (responseOrData instanceof Response) {
                var response = responseOrData;
                if (response.ok) {
                  var contentType = response.headers.get('content-type');
                  if (contentType && contentType.startsWith('application/json')) {
                    var _ret2 = function () {
                      var location = response.headers.get('location');
                      var promise = response.json();
                      return {
                        v: location ? promise.then(function (obj) {
                          obj[LOCATION] = location;
                          return obj;
                        }) : promise
                      };
                    }();

                    if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
                  }
                }
                return null;
              }
              return responseOrData;
            }).catch(function () {
              return null;
            });
          })
        }]);

        return Server;
      }();
    }
  };
});