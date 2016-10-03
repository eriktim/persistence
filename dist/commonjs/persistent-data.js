'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PersistentData = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.readValue = readValue;

var _symbols = require('./symbols');

var _util = require('./util');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var dataMap = new WeakMap();
var serializedDataMap = new WeakMap();
var PATH_SPLITTER = /[.\[)](.+)?/;

function getData(obj) {
  if (!dataMap.has(obj)) {
    dataMap.set(obj, {});
  }
  return dataMap.get(obj);
}

function nextProperty(path) {
  var _path$split = path.split(PATH_SPLITTER);

  var _path$split2 = _slicedToArray(_path$split, 2);

  var property = _path$split2[0];
  var subpath = _path$split2[1];

  return [property.replace(']', ''), subpath];
}

function readValue(obj, path) {
  var _nextProperty = nextProperty(path);

  var _nextProperty2 = _slicedToArray(_nextProperty, 2);

  var property = _nextProperty2[0];
  var subpath = _nextProperty2[1];

  if (subpath) {
    obj = obj[property];
    return obj ? readValue(obj, subpath) : undefined;
  }
  return obj[property];
}

function writeValue(obj, path, value) {
  var _nextProperty3 = nextProperty(path);

  var _nextProperty4 = _slicedToArray(_nextProperty3, 2);

  var property = _nextProperty4[0];
  var subpath = _nextProperty4[1];

  if (subpath) {
    if (!(property in obj)) {
      var _subpath$split = subpath.split(PATH_SPLITTER);

      var _subpath$split2 = _slicedToArray(_subpath$split, 1);

      var nextProp = _subpath$split2[0];

      obj[property] = nextProp.endsWith(']') ? [] : {};
    }
    obj = obj[property];
    return obj ? writeValue(obj, subpath, value) : false;
  }
  var update = obj[property] !== value;
  if (update) {
    obj[property] = value;
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
        obj[_symbols.VERSION]++;
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
      serializedDataMap.set(obj, serialize(data));
      obj[_symbols.VERSION]++;
    }
  }, {
    key: 'isDirty',
    value: function isDirty(obj) {
      return serializedDataMap.get(obj) !== serialize(PersistentData.extract(obj));
    }
  }]);

  return PersistentData;
}();