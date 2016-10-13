import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {Temporal, TemporalFormat} from '../../../src/decorator/temporal';
import {PersistentData} from '../../../src/persistent-data';
import {createEntityManagerStub} from '../helper';

function getTimezoneOffset() {
  let offset = new Date().getTimezoneOffset();
  let H = Math.floor(-offset / 60);
  let M = -offset % 60;
  let pad = val => (val < 10 ? '0' : '') + val;
  let prefix = offset <= 0 ? '+' : '';
  return prefix + pad(H) + ':' + pad(M);
}

const TZ_OFFSET = getTimezoneOffset();
const DATE = '2000-01-01';
const DATETIME = '2000-01-01 12:00:00';
const DEFAULT = '2000-01-01T12:00:00' + TZ_OFFSET;
const TIME = '12:00:00';

@Entity
class Foo {
  @Id
  key;

  @Temporal
  noFactory;

  @Temporal()
  factory;

  @Temporal(TemporalFormat.DEFAULT)
  default;

  @Temporal(TemporalFormat.DATE)
  date;

  @Temporal(TemporalFormat.DATETIME)
  dateTime;

  @Temporal(TemporalFormat.TIME)
  time;
}

function checkDateTime(entity, data, property) {
  expect(entity[property]).toBeUndefined();
  entity[property] = DEFAULT;
  expect(data[property]).toEqual('2000-01-01T12:00:00' + TZ_OFFSET);
  expect(entity[property].year()).toEqual(2000);
  expect(entity[property].month() + 1).toEqual(1);
  expect(entity[property].date()).toEqual(1);
  expect(entity[property].hour()).toEqual(12);
  expect(entity[property].minute()).toEqual(0);
  expect(entity[property].second()).toEqual(0);
}

describe('@Temporal', () => {
  let foo;
  let data;

  beforeEach(() => {
    let entityManager = createEntityManagerStub();
    return entityManager.create(Foo, {}).then(f => {
      foo = f;
      data = PersistentData.extract(foo);
    });
  });

  it('No factory', () => {
    checkDateTime(foo, data, 'noFactory');
    expect(() => foo.noFactory = 'some day').toThrow();
  });

  it('Factory', () => {
    checkDateTime(foo, data, 'factory');
  });

  it('Default', () => {
    checkDateTime(foo, data, 'default');
  });

  it('Date', () => {
    expect(foo.date).toBeUndefined();
    foo.date = DATE;
    expect(data.date).toEqual('2000-01-01');
    expect(foo.date.year()).toEqual(2000);
    expect(foo.date.month() + 1).toEqual(1);
    expect(foo.date.date()).toEqual(1);
  });

  it('Date & time', () => {
    expect(foo.dateTime).toBeUndefined();
    foo.dateTime = DATETIME;
    expect(data.dateTime).toEqual('2000-01-01 12:00:00');
    expect(foo.dateTime.year()).toEqual(2000);
    expect(foo.dateTime.month() + 1).toEqual(1);
    expect(foo.dateTime.date()).toEqual(1);
    expect(foo.dateTime.hour()).toEqual(12);
    expect(foo.dateTime.minute()).toEqual(0);
    expect(foo.dateTime.second()).toEqual(0);
  });

  it('Time', () => {
    expect(foo.time).toBeUndefined();
    foo.time = TIME;
    expect(data.time).toEqual('12:00:00');
    expect(foo.time.hour()).toEqual(12);
    expect(foo.time.minute()).toEqual(0);
    expect(foo.time.second()).toEqual(0);
  });
});
