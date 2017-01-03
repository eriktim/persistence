import moment from 'moment';

import {PrimitiveAccessors} from './primitive';

const FORMAT = 'YYYY-MM-DDTHH:mm:ssZ';
const IS_TIMEZONE = /[+-][0-9]{2,2}:[0-9]{2,2}$/;

function parse(value, format) {
  let parser = typeof value === 'string' && IS_TIMEZONE.test(value) ?
    moment.parseZone : moment;
  return parser(value, format);
}

export class TemporalAccessors extends PrimitiveAccessors {
  get(target: PObject): any {
    let value = super.get(target);
    let m = parse(value, FORMAT);
    return m.isValid() ? m : undefined;
  }

  set(target: PObject, value: any): boolean {
    let m;
    if (moment.isMoment(value)) {
      m = value;
    } else {
      m = parse(value, FORMAT);
      if (!m.isValid()) {
        throw new Error(`invalid date: ${value}`);
      }
    }
    return super.set(target, m.format(FORMAT));
  }
}
