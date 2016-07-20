import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {Temporal, TemporalFormat} from '../../../src/decorator/temporal';
import {EntityData} from '../../../src/entity-data';
import {Stub} from '../stub';

const DATE = '2000-01-01';
const DATETIME = '2000-01-01 12:00:00';
const TIME = '12:00:00';

@Entity
class Foo {
  @Id
  key;

  @Temporal
  noFactory;

  @Temporal()
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
  entity[property] = DATETIME;
  expect(data[property]).toEqual('2000-01-01 12:00:00');
  expect(entity[property].year()).toEqual(2000);
  expect(entity[property].month() + 1).toEqual(1);
  expect(entity[property].date()).toEqual(1);
  expect(entity[property].hour()).toEqual(12);
  expect(entity[property].minute()).toEqual(0);
  expect(entity[property].second()).toEqual(0);
}

describe('Temporal', () => {
  let foo;
  let data;

  beforeEach(() => {
    let entityManager = Stub.createEntityManager();
    return entityManager.create(Foo, {}).then(f => {
      foo = f;
      data = EntityData.extract(foo);
    });
  });

  it('No factory', () => {
    checkDateTime(foo, data, 'noFactory');
    expect(() => foo.direct = 'some day').toThrow();
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
    checkDateTime(foo, data, 'dateTime');
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
