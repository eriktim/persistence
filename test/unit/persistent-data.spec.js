import {PersistentData, VERSION} from '../../src/persistent-data';

describe('PersistentData', () => {
  let obj;

  beforeEach(() => {
    obj = {};
  });

  it('no injection', () => {
    expect(PersistentData.extract(obj)).toBeNull();
    expect(PersistentData.getProperty(obj, 'foo')).toBeUndefined();
    expect(obj[VERSION]).toBeUndefined();
  });

  it('bad injection', () => {
    expect(() => PersistentData.inject(obj, [])).toThrow();
    expect(() => PersistentData.inject(obj, 'foo')).toThrow();
    expect(() => PersistentData.inject(obj, 1)).toThrow();
  });

  it('good injection', () => {
    PersistentData.inject(obj, {foo: 'bar'});
    expect(PersistentData.extract(obj)).toEqual({foo: 'bar'});
  });

  it('getProperty', () => {
    PersistentData.inject(obj, {foo: 'bar', baz: [{}, {foo: 'bar'}]});
    expect(obj[VERSION]).toEqual(1);
    expect(PersistentData.getProperty(obj, 'foo')).toEqual('bar');
    expect(PersistentData.getProperty(obj, 'bar')).toBeUndefined();
    expect(PersistentData.getProperty(obj, 'baz[0].foo')).toBeUndefined();
    expect(PersistentData.getProperty(obj, 'baz[1].foo')).toEqual('bar');
    expect(obj[VERSION]).toEqual(1);
  });

  it('setProperty', () => {
    let data = {};
    PersistentData.inject(obj, data);
    expect(obj[VERSION]).toEqual(1);
    PersistentData.setProperty(obj, 'foo', 'bar');
    expect(data).toEqual({foo: 'bar'});
    expect(obj[VERSION]).toEqual(2);
    PersistentData.setProperty(obj, 'foo', 'bar');
    expect(obj[VERSION]).toEqual(2);
    PersistentData.setProperty(obj, 'foo', 'baz');
    expect(obj[VERSION]).toEqual(3);
    PersistentData.setProperty(obj, 'bar[0].foo', 'baz');
    expect(data).toEqual({foo: 'baz', bar: [{foo: 'baz'}]});
    expect(obj[VERSION]).toEqual(4);
    PersistentData.setProperty(obj, 'baz.0.bar', 'foo');
    expect(data).toEqual(
        {foo: 'baz', bar: [{foo: 'baz'}], baz: {0: {bar: 'foo'}}});
    expect(obj[VERSION]).toEqual(5);
  });
});
