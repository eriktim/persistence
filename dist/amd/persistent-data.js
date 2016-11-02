define(['exports', './symbols', './util'], function (exports, _symbols, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.PersistentData = undefined;
  exports.readValue = readValue;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
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

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  var _slicedToArray = function () {
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

  var dataMap = new WeakMap();
  var serializedDataMap = new WeakMap();

  var COMMA_WITH_SPACE = /\s*,\s*/;
  var DOT_OUTSIDE_BRACKETS = /\.(?=(?:[^\]]|\[[^\]]*\])*$)/;
  var EQUAL_SIGN_WITH_SPACE = /\s*=\s*/;
  var ALL_BRACKETS = /\[[^\]]+\]/g;

  function getData(obj) {
    if (!dataMap.has(obj)) {
      dataMap.set(obj, {});
    }
    return dataMap.get(obj);
  }

  function keyToObject(key) {
    var keyObj = {};
    key.split(COMMA_WITH_SPACE).forEach(function (tuple) {
      var _tuple$split = tuple.split(EQUAL_SIGN_WITH_SPACE);

      var _tuple$split2 = _slicedToArray(_tuple$split, 2);

      var p = _tuple$split2[0];
      var v = _tuple$split2[1];

      keyObj[p] = v;
    });
    return keyObj;
  }

  function getObjectFromArray(baseObj, path) {
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var allowCreation = options.allowCreation || false;
    var isArray = options.isArray || false;
    var keys = path.match(ALL_BRACKETS).map(function (k) {
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
    var index = 0;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var key = _step.value;

        var lastKey = index++ === keys.length - 1;
        if (_util.Util.isInt(key)) {
          if (!(key in obj)) {
            if (!allowCreation) {
              obj = undefined;
              break;
            }
            obj[key] = lastKey && !isArray ? {} : [];
          }
          obj = obj[key];
        } else {
          (function () {
            if (!lastKey) {
              throw Error('invalid array index: ' + path);
            }
            var keyObj = keyToObject(key);
            var arr = obj;
            obj = arr.find(function (o) {
              for (var p in keyObj) {
                if (o[p] !== keyObj[p]) {
                  return false;
                }
              }
              return true;
            });
            if (!obj && allowCreation) {
              obj = keyObj;
              arr.push(obj);
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
      for (var _iterator2 = fullPath.split(DOT_OUTSIDE_BRACKETS)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
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

  function writeValue(baseObj, fullPath, value) {
    var obj = baseObj;
    var props = fullPath.split(DOT_OUTSIDE_BRACKETS);
    var lastProp = props.pop();
    var isArrayElement = lastProp.endsWith(']');
    if (isArrayElement) {
      var index = lastProp.lastIndexOf('[');
      props.push(lastProp.substring(0, index));
      lastProp = lastProp.substring(index + 1, lastProp.length - 1);
    }
    props.forEach(function (prop, index) {
      var endWithArray = isArrayElement && index === props.length - 1;
      if (prop.endsWith(']')) {
        obj = getObjectFromArray(obj, prop, {
          allowCreation: true,
          isArray: endWithArray
        });
      } else {
        if (!(prop in obj)) {
          obj[prop] = endWithArray ? [] : {};
        }
        obj = obj[prop];
      }
    });
    var update = obj ? obj[lastProp] !== value : false;
    if (update) {
      obj[lastProp] = value;
    }
    return update;
  }

  function serialize(data) {
    return JSON.stringify(data || {});
  }

  var PersistentData = exports.PersistentData = function () {
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
          do {
            obj[_symbols.VERSION]++;
            obj = obj[_symbols.PARENT];
          } while (obj);
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
        if (!_util.Util.isObject(data)) {
          throw new TypeError('injection data must be an object');
        }
        if (!Reflect.has(obj, _symbols.VERSION)) {
          (0, _symbols.defineSymbol)(obj, _symbols.VERSION, 0);
        }
        dataMap.set(obj, data);
        this.setNotDirty(obj);
        obj[_symbols.VERSION]++;
      }
    }, {
      key: 'isDirty',
      value: function isDirty(obj) {
        return serializedDataMap.get(obj) !== serialize(PersistentData.extract(obj));
      }
    }, {
      key: 'setNotDirty',
      value: function setNotDirty(obj) {
        var data = PersistentData.extract(obj);
        serializedDataMap.set(obj, serialize(data));
      }
    }]);

    return PersistentData;
  }();
});