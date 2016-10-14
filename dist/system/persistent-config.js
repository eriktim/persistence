'use strict';

System.register(['./persistent-data', './util'], function (_export, _context) {
  "use strict";

  var PersistentData, Util, _typeof, _createClass, configurations, propertyKeys, PropertyType, PersistentConfig, EntityPropertyConfig;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_persistentData) {
      PersistentData = _persistentData.PersistentData;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {
      _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
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

      configurations = new WeakMap();
      propertyKeys = new Map();

      _export('PropertyType', PropertyType = Object.freeze({
        COLLECTION: 'collection',
        EMBEDDED: 'embedded',
        TEMPORAL: 'temporal',
        TRANSIENT: 'transient'
      }));

      _export('PropertyType', PropertyType);

      _export('PersistentConfig', PersistentConfig = function () {
        function PersistentConfig() {
          _classCallCheck(this, PersistentConfig);

          this.idKey = undefined;
          this.path = undefined;
          this.postLoad = undefined;
          this.postPersist = undefined;
          this.postRemove = undefined;
          this.preLoad = undefined;
          this.prePersist = undefined;
          this.preRemove = undefined;
          this.propertyMap = {};
        }

        _createClass(PersistentConfig, [{
          key: 'configure',
          value: function configure(config) {
            var _this = this;

            Object.keys(config).forEach(function (key) {
              if (!Reflect.has(_this, key)) {
                throw new Error('entity key \'' + key + '\' is not a valid configuration');
              }
              if (_this[key]) {
                if (/^(pre|post)/.test(key)) {
                  var _ret = function () {
                    var cb1 = _this[key];
                    var cb2 = config[key];
                    _this[key] = function () {
                      Reflect.apply(cb1, this, []);
                      Reflect.apply(cb2, this, []);
                    };
                    return {
                      v: void 0
                    };
                  }();

                  if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
                }
                throw new Error('entity key \'' + key + '\' cannot be re-configured');
              }
              _this[key] = config[key];
            });
          }
        }, {
          key: 'configureProperty',
          value: function configureProperty(propertyKey, config) {
            if (!(propertyKey in this.propertyMap)) {
              this.propertyMap[propertyKey] = new EntityPropertyConfig(propertyKey);
            }
            this.propertyMap[propertyKey].configure(config);
          }
        }, {
          key: 'getProperty',
          value: function getProperty(propertyKey) {
            if (!(propertyKey in this.propertyMap)) {
              this.configureProperty(propertyKey, {});
            }
            return this.propertyMap[propertyKey];
          }
        }], [{
          key: 'get',
          value: function get(objectOrClass) {
            var Class = Util.getClass(objectOrClass);
            if (!configurations.has(Class)) {
              var config = new PersistentConfig();
              var SuperClass = Object.getPrototypeOf(Class);
              if (configurations.has(SuperClass)) {
                var superConfig = configurations.get(SuperClass);
                for (var key in superConfig) {
                  if (key === 'propertyMap') {
                    Object.assign(config[key], superConfig[key]);
                  } else {
                    config[key] = superConfig[key];
                  }
                }
              }
              configurations.set(Class, config);
            }
            return configurations.get(Class);
          }
        }, {
          key: 'has',
          value: function has(objectOrClass) {
            var Class = Util.getClass(objectOrClass);
            return configurations.has(Class);
          }
        }]);

        return PersistentConfig;
      }());

      _export('PersistentConfig', PersistentConfig);

      EntityPropertyConfig = function () {
        _createClass(EntityPropertyConfig, [{
          key: 'fullPath',
          get: function get() {
            return this.path || propertyKeys.get(this);
          }
        }]);

        function EntityPropertyConfig(propertyKey) {
          _classCallCheck(this, EntityPropertyConfig);

          this.getter = undefined;
          this.path = undefined;
          this.setter = undefined;
          this.type = undefined;

          var config = this;
          propertyKeys.set(config, propertyKey);
          this.getter = function () {
            return PersistentData.getProperty(this, config.fullPath);
          };
          this.setter = function (value) {
            return PersistentData.setProperty(this, config.fullPath, value);
          };
        }

        _createClass(EntityPropertyConfig, [{
          key: 'configure',
          value: function configure(config) {
            var _this2 = this;

            Object.keys(config).forEach(function (key) {
              if (!Reflect.has(_this2, key)) {
                throw new Error('unknown entity property configuration key: ' + key);
              }
              _this2[key] = config[key];
            });
          }
        }]);

        return EntityPropertyConfig;
      }();
    }
  };
});