define(['exports', './util'], function (exports, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.VERSION = exports.REMOVED = exports.RELATIONS = exports.PARENT = exports.ENTITY_MANAGER = undefined;
  exports.defineSymbol = defineSymbol;
  var ENTITY_MANAGER = exports.ENTITY_MANAGER = '__entityManager__';
  var PARENT = exports.PARENT = '__parent__';
  var RELATIONS = exports.RELATIONS = '__relations__';
  var REMOVED = exports.REMOVED = '__removed__';
  var VERSION = exports.VERSION = '__version__';

  function defineSymbol(obj, symbol) {
    var descriptor = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (!_util.Util.isObject(descriptor)) {
      descriptor = { value: descriptor };
    }
    Reflect.defineProperty(obj, symbol, Object.assign({
      configurable: true,
      enumerable: false,
      writable: true,
      value: undefined
    }, descriptor));
  }
});