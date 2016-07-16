'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.EntityData = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _util = require('./util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VERSION = '__version__';
var dataMap = new WeakMap();

function getData(entity) {
  if (!dataMap.has(entity)) {
    dataMap.set(entity, {});
  }
  return dataMap.get(entity);
}

var EntityData = exports.EntityData = function () {
  function EntityData() {
    _classCallCheck(this, EntityData);
  }

  _createClass(EntityData, null, [{
    key: 'getProperty',
    value: function getProperty(entity, propertyPath) {
      return getData(entity)[propertyPath];
    }
  }, {
    key: 'setProperty',
    value: function setProperty(entity, propertyPath, value) {
      var data = getData(entity);
      if (value !== data[propertyPath]) {
        data[propertyPath] = value;
        entity[VERSION]++;
      }
    }
  }, {
    key: 'extract',
    value: function extract(entity) {
      if (!dataMap.has(entity)) {
        return null;
      }
      return dataMap.get(entity);
    }
  }, {
    key: 'inject',
    value: function inject(entity, data) {
      if (!_util.Util.isObject(data)) {
        throw new Error('injection data must be an object');
      }
      if (!Reflect.has(entity, VERSION)) {
        Reflect.defineProperty(entity, VERSION, {
          configurable: true,
          enumerable: false,
          writable: true,
          value: 1
        });
      }
      dataMap.set(entity, data);
    }
  }]);

  return EntityData;
}();