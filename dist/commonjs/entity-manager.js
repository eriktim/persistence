'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EntityManager = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.getServerForTesting = getServerForTesting;

var _config = require('./config');

var _entityConfig = require('./entity-config');

var _entityData = require('./entity-data');

var _util = require('./util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var servers = new WeakMap();

function getServerForTesting(resourceManager) {
  return servers.get(resourceManager);
}

function getId(entity) {
  return entity[_entityConfig.EntityConfig.get(entity).idKey];
}

function getPath(entityOrEntity) {
  var Entity = _util.Util.getClass(entityOrEntity);
  var path = _entityConfig.EntityConfig.get(Entity).path;
  if (!path) {
    throw new Error('object is not a valid entity');
  }
  return path;
}

function waitForCall(fn, thisObj) {
  return Promise.resolve(fn ? Reflect.apply(fn, thisObj, []) : undefined);
}

function toParams() {
  for (var _len = arguments.length, maps = Array(_len), _key = 0; _key < _len; _key++) {
    maps[_key] = arguments[_key];
  }

  var flatMap = maps.map(function (map) {
    if (!_util.Util.is(map)) {
      return {};
    }
    if (!_util.Util.isObject(map)) {
      throw new TypeError('argument should be an \'object\'');
    }
    return map;
  }).reduce(function (flat, map) {
    return Object.assign(flat, map);
  }, {});

  return Object.keys(flatMap).map(function (key) {
    return encodeURIComponent(key) + '=' + encodeURIComponent(flatMap[key]);
  }).join('&');
}

var EntityManager = exports.EntityManager = function () {
  function EntityManager() {
    var config = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

    _classCallCheck(this, EntityManager);

    config = config || _config.Config.getDefault();
    if (!(config instanceof _config.Config)) {
      throw new Error('EntityManagerFactory requires a Config');
    }
    this.config = config.current;
    servers.set(this, new Server(this.config));
  }

  _createClass(EntityManager, [{
    key: 'create',
    value: function create(Target, data) {
      var _this = this;

      return Promise.resolve().then(function () {
        if (!_entityConfig.EntityConfig.has(Target)) {
          throw new Error('EntityFactory expects a valid Entity');
        }
        if (!_util.Util.isObject(data)) {
          return null;
        }
        var config = _entityConfig.EntityConfig.get(Target);
        var entity = new Target(_this);
        return Promise.resolve().then(function () {
          return waitForCall(config.preLoad, entity);
        }).then(function () {
          return _entityData.EntityData.inject(entity, data);
        }).then(function () {
          return waitForCall(config.postLoad, entity);
        }).then(function () {
          return entity;
        });
      });
    }
  }, {
    key: 'findById',
    value: function findById(Entity, id) {
      var _this2 = this;

      return Promise.resolve().then(function () {
        if (typeof id !== 'string' && typeof id !== 'number') {
          throw new TypeError('id must be a \'string\' or \'number\', not \'' + (typeof id === 'undefined' ? 'undefined' : _typeof(id)) + '\'');
        }
        var path = getPath(Entity);
        return servers.get(_this2).get(path + '/' + id).then(function (data) {
          return _this2.create(Entity, data);
        });
      });
    }
  }, {
    key: 'find',
    value: function find(Entity) {
      var _this3 = this;

      var propertyMap = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return Promise.resolve().then(function () {
        var path = getPath(Entity);
        return servers.get(_this3).get(path, propertyMap).then(function (array) {
          return Promise.all(array ? array.map(function (data) {
            return _this3.create(Entity, data);
          }) : []);
        });
      });
    }
  }, {
    key: 'save',
    value: function save(entity) {
      var _this4 = this;

      return Promise.resolve().then(function () {
        var id = getId(entity);
        var fetch = id ? servers.get(_this4).put : servers.get(_this4).post;
        var path = getPath(entity);
        var config = _entityConfig.EntityConfig.get(entity);
        var data = _entityData.EntityData.extract(entity);
        return Promise.resolve().then(function () {
          return waitForCall(config.prePersist, entity);
        }).then(function () {
          return Reflect.apply(fetch, servers.get(_this4), [id ? path + '/' + id : path, data]);
        }).then(function (raw) {
          return raw && _entityData.EntityData.inject(entity, raw);
        }).then(function () {
          return waitForCall(config.postPersist, entity);
        }).then(function () {
          return entity;
        });
      });
    }
  }, {
    key: 'setInterceptor',
    value: function setInterceptor(requestInterceptor) {
      servers.get(this).requestInterceptor = requestInterceptor;
    }
  }, {
    key: 'reload',
    value: function reload(entity) {
      var _this5 = this;

      return Promise.resolve().then(function () {
        var Entity = _util.Util.getClass(entity);
        var idKey = _entityConfig.EntityConfig.get(Entity).idKey;
        var id = entity[idKey];
        _entityData.EntityData.inject(entity, {});
        return _this5.findById(Entity, id);
      });
    }
  }, {
    key: 'remove',
    value: function remove(entity) {
      var _this6 = this;

      return Promise.resolve().then(function () {
        var id = getId(entity);
        var path = getPath(entity);
        var config = _entityConfig.EntityConfig.get(entity);
        return Promise.resolve().then(function () {
          return waitForCall(config.preRemove, entity);
        }).then(function () {
          return id ? servers.get(_this6).delete(path + '/' + id) : undefined;
        }).then(function () {
          return config.configure({ removed: true });
        }).then(function () {
          return waitForCall(config.postRemove, entity);
        }).then(function () {
          return entity;
        });
      });
    }
  }]);

  return EntityManager;
}();

var Server = function () {
  function Server(config) {
    _classCallCheck(this, Server);

    this.baseUrl = (config.baseUrl || '').replace(/\/$/, '');
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
      var propertyMap = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      return this.fetch(path, {
        method: 'GET'
      }, propertyMap);
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
      function fetch(_x3, _x4) {
        return _fetch.apply(this, arguments);
      }

      fetch.toString = function () {
        return _fetch.toString();
      };

      return fetch;
    }(function (path, init) {
      var _this7 = this;

      var propertyMap = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

      var url = this.baseUrl + '/' + path;
      var params = toParams(propertyMap);
      init.headers = new Headers({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      });
      var request = new Request(url + '?' + params, init);
      return Promise.resolve().then(function () {
        if (typeof _this7.requestInterceptor === 'function') {
          return _this7.requestInterceptor(request);
        }
      }).then(function (requestOrResponse) {
        return requestOrResponse instanceof Response ? requestOrResponse : fetch(requestOrResponse || request);
      }).then(function (response) {
        if (response.ok) {
          var contentType = response.headers.get('content-type');
          if (contentType && contentType.startsWith('application/json')) {
            return response.json();
          }
        }
        return null;
      }).catch(function (err) {
        console.error(err.message);
        return null;
      });
    })
  }]);

  return Server;
}();