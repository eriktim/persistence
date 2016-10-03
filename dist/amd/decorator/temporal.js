define(['exports', 'moment', '../persistent-config', '../util'], function (exports, _moment, _persistentConfig, _util) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.TemporalFormat = undefined;
  exports.Temporal = Temporal;

  var _moment2 = _interopRequireDefault(_moment);

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
      default: obj
    };
  }

  var TemporalFormat = exports.TemporalFormat = Object.seal({
    DATETIME: 'YYYY-MM-DD HH:mm:ss',
    DATE: 'YYYY-MM-DD',
    TIME: 'HH:mm:ss'
  });

  var formats = Object.keys(TemporalFormat).map(function (key) {
    return TemporalFormat[key];
  });

  function Temporal(formatOrTarget, optPropertyKey, optDescriptor) {
    var isDecorator = _util.Util.isPropertyDecorator.apply(_util.Util, arguments);
    var format = TemporalFormat.DATETIME;
    if (!isDecorator) {
      format = formatOrTarget || TemporalFormat.DATETIME;
      if (!formats.find(function (f) {
        return f === format;
      })) {
        throw new Error('invalid type for @Temporal() ' + optPropertyKey);
      }
    }
    var deco = function deco(target, propertyKey) {
      var config = _persistentConfig.PersistentConfig.get(target).getProperty(propertyKey);
      var _getter = config.getter;
      var _setter = config.setter;
      config.configure({
        type: _persistentConfig.PropertyType.TEMPORAL,
        getter: function getter() {
          var value = Reflect.apply(_getter, this, []);
          var val = (0, _moment2.default)(value, format);
          return val.isValid() ? val : undefined;
        },
        setter: function setter(value) {
          var val = (0, _moment2.default)(value, format);
          if (!val.isValid()) {
            throw new Error('invalid date: ' + value);
          }
          return Reflect.apply(_setter, this, [val.format(format)]);
        }
      });
    };
    return isDecorator ? deco(formatOrTarget, optPropertyKey, optDescriptor) : deco;
  }
});