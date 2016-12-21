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
    let config = PersistentConfig.get(target);
    config.configure({
      idKey: propertyKey
    });
    config.configureProperty(propertyKey, {type: PropertyType.TEMPORAL});
  };
}
