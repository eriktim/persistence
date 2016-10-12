'use strict';

System.register(['./util'], function (_export, _context) {
  "use strict";

  var Util, ENTITY_MANAGER, REMOVED, VERSION;
  function defineSymbol(obj, symbol) {
    var descriptor = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    if (!Util.isObject(descriptor)) {
      descriptor = { value: descriptor };
    }
    Reflect.defineProperty(obj, symbol, Object.assign({
      configurable: true,
      enumerable: false,
      writable: true,
      value: undefined
    }, descriptor));
  }

  _export('defineSymbol', defineSymbol);

  return {
    setters: [function (_util) {
      Util = _util.Util;
    }],
    execute: function () {
      _export('ENTITY_MANAGER', ENTITY_MANAGER = '__entityManager__');

      _export('ENTITY_MANAGER', ENTITY_MANAGER);

      _export('REMOVED', REMOVED = '__removed__');

      _export('REMOVED', REMOVED);

      _export('VERSION', VERSION = '__version__');

      _export('VERSION', VERSION);
    }
  };
});