'use strict';

System.register(['../util'], function (_export, _context) {
  "use strict";

  var Util;
  function ManyToOne(TypeOrTarget, optPropertyKey, optDescriptor) {
    var isDecorator = Util.isPropertyDecorator.apply(Util, arguments);
    var deco = function deco(target, propertyKey, descriptor) {
      throw new Error('not yet implemented');
    };

    return isDecorator ? deco(TypeOrTarget, optPropertyKey, optDescriptor) : deco;
  }

  _export('ManyToOne', ManyToOne);

  return {
    setters: [function (_util) {
      Util = _util.Util;
    }],
    execute: function () {}
  };
});