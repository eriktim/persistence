'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EntityConfig = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('./util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var configurations = new WeakMap();

var EntityConfig = exports.EntityConfig = function () {
  function EntityConfig() {
    _classCallCheck(this, EntityConfig);

    this.idKey = undefined;
    this.path = undefined;
    this.postLoad = undefined;
    this.postPersist = undefined;
    this.postRemove = undefined;
    this.preLoad = undefined;
    this.prePersist = undefined;
    this.preRemove = undefined;
    this.propertyMap = {};
    this.removed = false;
  }

  _createClass(EntityConfig, [{
    key: 'configure',
    value: function configure(config) {
      var _this = this;

      Object.keys(config).forEach(function (key) {
        if (!Reflect.has(_this, key)) {
          throw new Error('entity key \'' + key + '\' is not a valid configuration');
        }
        if (_this[key]) {
          throw new Error('entity key \'' + key + '\' cannot be re-configured');
        }
        _this[key] = config[key];
      });
    }
  }, {
    key: 'configureProperty',
    value: function configureProperty(propertyKey, config) {
      if (!(propertyKey in this.propertyMap)) {
        this.propertyMap[propertyKey] = new EntityPropertyConfig();
      }
      this.propertyMap[propertyKey].configure(config);
    }
  }, {
    key: 'getProperty',
    value: function getProperty(propertyKey) {
      return this.propertyMap[propertyKey];
    }
  }], [{
    key: 'get',
    value: function get(target) {
      var Target = _util.Util.getClass(target);
      if (!configurations.has(Target)) {
        configurations.set(Target, new EntityConfig());
      }
      return configurations.get(Target);
    }
  }, {
    key: 'has',
    value: function has(target) {
      var Target = _util.Util.getClass(target);
      return configurations.has(Target);
    }
  }]);

  return EntityConfig;
}();

var EntityPropertyConfig = function () {
  function EntityPropertyConfig() {
    _classCallCheck(this, EntityPropertyConfig);

    this.getter = undefined;
    this.path = undefined;
    this.setter = undefined;
    this.transient = undefined;
  }

  _createClass(EntityPropertyConfig, [{
    key: 'configure',
    value: function configure(config) {
      var _this2 = this;

      Object.keys(config).forEach(function (key) {
        if (!Reflect.has(_this2, key)) {
          throw new Error('entity property key \'' + key + '\' is not a valid configuration');
        }
        if (_this2[key]) {
          throw new Error('entity property key \'' + key + '\' is already configured');
        }
        _this2[key] = config[key];
      });
    }
  }]);

  return EntityPropertyConfig;
}();