import moment from 'moment';

import {EntityConfig} from '../entity-config';
import {Util} from '../util';

export const TemporalFormat = Object.seal({
  DATETIME: 'YYYY-MM-DD HH:mm:ss',
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss'
});

const formats = Object.keys(TemporalFormat).map(key => TemporalFormat[key]);

export function Temporal(formatOrTarget, optPropertyKey, optDescriptor) {
  let isDecorator = Util.isPropertyDecorator(...arguments);
  let format = TemporalFormat.DATETIME;
  if (!isDecorator) {
    format = formatOrTarget || TemporalFormat.DATETIME;
    if (!formats.find(f => f === format)) {
      throw new Error(`invalid type for @Temporal() ${optPropertyKey}`);
    }
  }
  let deco = function(target, propertyKey) {
    let config = EntityConfig.get(target).getProperty(propertyKey);
    let getter = config.getter;
    let setter = config.setter;
    config.configure({
      getter: function() {
        let value = Reflect.apply(getter, this, []);
        let val = moment(value, format);
        return val.isValid() ? val : undefined;
      },
      setter: function(value) {
        let val = moment(value, format);
        if (!val.isValid()) {
          throw new Error(`invalid date: ${value}`);
        }
        return Reflect.apply(setter, this, [val.format(format)]);
      }
    });
  };
  return isDecorator ?
      deco(formatOrTarget, optPropertyKey, optDescriptor) : deco;
}
