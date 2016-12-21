import moment from 'moment';

import {PersistentConfig, PropertyType} from '../persistent-config';

export const TemporalFormat = Object.seal({
  DEFAULT: 'YYYY-MM-DDTHH:mm:ssZ',
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss'
});

const IS_TIMEZONE = /[+-][0-9]{2,2}:[0-9]{2,2}$/;

const formats = Object.keys(TemporalFormat).map(key => TemporalFormat[key]);

function parse(value, format) {
  let parser = typeof value === 'string' && IS_TIMEZONE.test(value) ?
      moment.parseZone : moment;
  return parser(value, format);
}

export function Temporal(format: string = TemporalFormat.DEFAULT) {
  return function(target: PObject, propertyKey: PropertyKey) {
    if (!formats.find(f => f === format)) {
      throw new Error(`invalid type for @Temporal() ${propertyKey}`);
    }
    let config = PersistentConfig.get(target).getProperty(propertyKey);
    let getter = config.getter;
    let setter = config.setter;
    config.configure({
      type: PropertyType.TEMPORAL,
      getter: function() {
        let value = Reflect.apply(getter, this, []);
        let val = parse(value, format);
        return val.isValid() ? val : undefined;
      },
      setter: function(value: moment.Moment) {
        let val = value;
        if (!moment.isMoment(val)) {
          val = parse(value, format);
          if (!val.isValid()) {
            throw new Error(`invalid date: ${value}`);
          }
        }
        return Reflect.apply(setter, this, [val.format(format)]);
      }
    });
  };
}
