'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TemporalFormat = undefined;
exports.Temporal = Temporal;

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _persistentConfig = require('../persistent-config');

var _util = require('../util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TemporalFormat = exports.TemporalFormat = Object.seal({
  DEFAULT: 'YYYY-MM-DDTHH:mm:ssZ',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss'
});

var IS_TIMEZONE = /[+-][0-9]{2,2}:[0-9]{2,2}$/;

var formats = Object.keys(TemporalFormat).map(function (key) {
  return TemporalFormat[key];
});

function parse(value, format) {
  var parser = typeof value === 'string' && IS_TIMEZONE.test(value) ? _moment2.default.parseZone : _moment2.default;
  return parser(value, format);
}

function Temporal(formatOrTarget, optPropertyKey, optDescriptor) {
  var isDecorator = _util.Util.isPropertyDecorator.apply(_util.Util, arguments);
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
    var config = _persistentConfig.PersistentConfig.get(target).getProperty(propertyKey);
    var _getter = config.getter;
    var _setter = config.setter;
    config.configure({
      type: _persistentConfig.PropertyType.TEMPORAL,
      getter: function getter() {
        var value = Reflect.apply(_getter, this, []);
        var val = parse(value, format);
        return val.isValid() ? val : undefined;
      },
      setter: function setter(value) {
        var val = value;
        if (!_moment2.default.isMoment(val)) {
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