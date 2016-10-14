'use strict';

System.register(['moment', '../persistent-config', '../util'], function (_export, _context) {
  "use strict";

  var moment, PersistentConfig, PropertyType, Util, TemporalFormat, IS_TIMEZONE, formats;


  function parse(value, format) {
    var parser = typeof value === 'string' && IS_TIMEZONE.test(value) ? moment.parseZone : moment;
    return parser(value, format);
  }

  function Temporal(formatOrTarget, optPropertyKey, optDescriptor) {
    var isDecorator = Util.isPropertyDecorator.apply(Util, arguments);
    var format = TemporalFormat.DEFAULT;
    if (!isDecorator) {
      format = formatOrTarget || format;
      if (!formats.find(function (f) {
        return f === format;
      })) {
        throw new Error('invalid type for @Temporal() ' + optPropertyKey);
      }
    }
    var deco = function deco(target, propertyKey) {
      var config = PersistentConfig.get(target).getProperty(propertyKey);
      var _getter = config.getter;
      var _setter = config.setter;
      config.configure({
        type: PropertyType.TEMPORAL,
        getter: function getter() {
          var value = Reflect.apply(_getter, this, []);
          var val = parse(value, format);
          return val.isValid() ? val : undefined;
        },
        setter: function setter(value) {
          var val = value;
          if (!moment.isMoment(val)) {
            val = parse(value, format);
            if (!val.isValid()) {
              throw new Error('invalid date: ' + value);
            }
          }
          return Reflect.apply(_setter, this, [val.format(format)]);
        }
      });
    };
    return isDecorator ? deco(formatOrTarget, optPropertyKey, optDescriptor) : deco;
  }

  _export('Temporal', Temporal);

  return {
    setters: [function (_moment) {
      moment = _moment.default;
    }, function (_persistentConfig) {
      PersistentConfig = _persistentConfig.PersistentConfig;
      PropertyType = _persistentConfig.PropertyType;
    }, function (_util) {
      Util = _util.Util;
    }],
    execute: function () {
      _export('TemporalFormat', TemporalFormat = Object.seal({
        DEFAULT: 'YYYY-MM-DDTHH:mm:ssZ',
        DATETIME: 'YYYY-MM-DD HH:mm:ss',
        DATE: 'YYYY-MM-DD',
        TIME: 'HH:mm:ss'
      }));

      _export('TemporalFormat', TemporalFormat);

      IS_TIMEZONE = /[+-][0-9]{2,2}:[0-9]{2,2}$/;
      formats = Object.keys(TemporalFormat).map(function (key) {
        return TemporalFormat[key];
      });
    }
  };
});