'use strict';

System.register(['./symbols', './util'], function (_export, _context) {
  "use strict";

  var VERSION, defineSymbol, Util, _createClass, _typeof, _slicedToArray, dataMap, serializedDataMap, PersistentData;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function getData(obj) {
    if (!dataMap.has(obj)) {
      dataMap.set(obj, {});
    }
    return dataMap.get(obj);
  }

  function keyToObject(key) {
    var keyObj = {};
    key.split(/\s*,\s*/).forEach(function (tuple) {
      var _tuple$split = tuple.split(/\s*=\s*/);

      var _tuple$split2 = _slicedToArray(_tuple$split, 2);

      var p = _tuple$split2[0];
      var v = _tuple$split2[1];

      keyObj[p] = v;
    });
    return keyObj;
  }

  function getObjectFromArray(baseObj, path, allowCreation) {
    var keys = path.match(/\[[^\]]+\]/g).map(function (k) {
      return k.substring(1, k.length - 1);
    });
    var prop = path.substring(0, path.indexOf('['));
    if (!(prop in baseObj)) {
      if (!allowCreation) {
        return undefined;
      }
      baseObj[prop] = [];
    }
    var obj = baseObj[prop];
    if (!Array.isArray(obj)) {
      return undefined;
    }
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var key = _step.value;

        var lastKey = keys.indexOf(key) === keys.length - 1;
        if (Util.isInt(key)) {
          if (!(key in obj)) {
            if (!allowCreation) {
              obj = undefined;
              break;
            }
            obj[key] = lastKey ? {} : [];
          }
          obj = obj[key];
        } else {
          (function () {
            if (!lastKey) {
              throw Error('invalid array index: ' + path);
            }
            var keyObj = keyToObject(key);
            obj = obj.find(function (o) {
              for (var p in keyObj) {
                if (o[p] !== keyObj[p]) {
                  return false;
                }
              }
              return true;
            });
            if (!obj && allowCreation) {
              obj = keyObj;
            }
          })();
        }
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

    return obj;
  }

  function readValue(baseObj, fullPath) {
    var obj = baseObj;
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = fullPath.split('.')[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var prop = _step2.value;

        if (prop.charAt(prop.length - 1) === ']') {
          obj = getObjectFromArray(obj, prop);
        } else {
          obj = obj[prop];
        }
        if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object' || obj === null) {
          break;
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return obj;
  }

  _export('readValue', readValue);

  function writeValue(baseObj, fullPath, value) {
    var obj = baseObj;
    var props = fullPath.split('.');
    var lastProp = props.pop();
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = props[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var prop = _step3.value;

        if (prop.charAt(prop.length - 1) === ']') {
          obj = getObjectFromArray(obj, prop, true);
        } else {
          if (!(prop in obj)) {
            obj[prop] = {};
          }
          obj = obj[prop];
        }
      }
    } catch (err) {
      _didIteratorError3 = true;
      _iteratorError3 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion3 && _iterator3.return) {
          _iterator3.return();
        }
      } finally {
        if (_didIteratorError3) {
          throw _iteratorError3;
        }
      }
    }

    var update = obj ? obj[lastProp] !== value : false;
    if (update) {
      obj[lastProp] = value;
    }
    return update;
  }

  function serialize(data) {
    return JSON.stringify(data || {});
  }

  return {
    setters: [function (_symbols) {
      VERSION = _symbols.VERSION;
      defineSymbol = _symbols.defineSymbol;
    }, function (_util) {
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

      _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };

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

      dataMap = new WeakMap();
      serializedDataMap = new WeakMap();

      _export('PersistentData', PersistentData = function () {
        function PersistentData() {
          _classCallCheck(this, PersistentData);
        }

        _createClass(PersistentData, null, [{
          key: 'getProperty',
          value: function getProperty(obj, path) {
            var data = getData(obj);
            return readValue(data, path);
          }
        }, {
          key: 'setProperty',
          value: function setProperty(obj, path, value) {
            var data = getData(obj);
            if (writeValue(data, path, value)) {
              obj[VERSION]++;
            }
          }
        }, {
          key: 'extract',
          value: function extract(obj) {
            return dataMap.has(obj) ? dataMap.get(obj) : null;
          }
        }, {
          key: 'inject',
          value: function inject(obj, data) {
            if (!Util.isObject(data)) {
              throw new TypeError('injection data must be an object');
            }
            if (!Reflect.has(obj, VERSION)) {
              defineSymbol(obj, VERSION, 0);
            }
            dataMap.set(obj, data);
            serializedDataMap.set(obj, serialize(data));
            obj[VERSION]++;
          }
        }, {
          key: 'isDirty',
          value: function isDirty(obj) {
            return serializedDataMap.get(obj) !== serialize(PersistentData.extract(obj));
          }
        }]);

        return PersistentData;
      }());

      _export('PersistentData', PersistentData);
    }
  };
});