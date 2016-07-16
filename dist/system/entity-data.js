'use strict';

System.register(['./util'], function (_export, _context) {
  var Util, _createClass, VERSION, dataMap, EntityData;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function getData(entity) {
    if (!dataMap.has(entity)) {
      dataMap.set(entity, {});
    }
    return dataMap.get(entity);
  }

  return {
    setters: [function (_util) {
      Util = _util.Util;
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

      VERSION = '__version__';
      dataMap = new WeakMap();

      _export('EntityData', EntityData = function () {
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
            if (!Util.isObject(data)) {
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
      }());

      _export('EntityData', EntityData);
    }
  };
});