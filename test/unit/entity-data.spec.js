import {EntityData} from '../../src/entity-data';

const VERSION = '__version__';

describe('EntityData', () => {
  let obj;

  beforeEach(() => {
    obj = {};
  });

  it('no injection', () => {
    expect(EntityData.extract(obj)).toBeNull();
    expect(EntityData.getProperty(obj, 'foo')).toBeUndefined();
    expect(obj[VERSION]).toBeUndefined();
  });

  it('bad injection', () => {
    expect(() => EntityData.inject(obj, [])).toThrow();
    expect(() => EntityData.inject(obj, 'foo')).toThrow();
    expect(() => EntityData.inject(obj, 1)).toThrow();
  });

  it('good injection', () => {
    EntityData.inject(obj, {foo: 'bar'});
    expect(EntityData.extract(obj)).toEqual({foo: 'bar'});
  });

  it('getProperty', () => {
    EntityData.inject(obj, {foo: 'bar'});
    expect(obj[VERSION]).toEqual(1);
    expect(EntityData.getProperty(obj, 'foo')).toEqual('bar');
    expect(EntityData.getProperty(obj, 'bar')).toBeUndefined();
    expect(obj[VERSION]).toEqual(1);
  });

  it('setProperty', () => {
    let data = {};
    EntityData.inject(obj, data);
    expect(obj[VERSION]).toEqual(1);
    EntityData.setProperty(obj, 'foo', 'bar');
    expect(data).toEqual({foo: 'bar'});
    expect(obj[VERSION]).toEqual(2);
    EntityData.setProperty(obj, 'foo', 'bar');
    expect(obj[VERSION]).toEqual(2);
    EntityData.setProperty(obj, 'foo', 'baz');
    expect(obj[VERSION]).toEqual(3);
  });
});
