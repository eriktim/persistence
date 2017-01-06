import {PersistentData} from '../../src/persistent-data';

describe('PersistentData', () => {
  let obj;

  beforeEach(() => {
    obj = {};
  });

  it('no injection', () => {
    expect(PersistentData.extract(obj)).toBeNull();
    expect(PersistentData.getProperty(obj, 'foo')).toBeUndefined();
  });

  it('bad injection', () => {
    expect(() => PersistentData.inject(obj, 'foo')).toThrow();
    expect(() => PersistentData.inject(obj, 1)).toThrow();
  });

  it('good injection', () => {
    PersistentData.inject(obj, {foo: 'bar'});
    expect(PersistentData.extract(obj)).toEqual({foo: 'bar'});
    PersistentData.inject(obj, [{bar: 'foo'}]);
    expect(PersistentData.extract(obj)).toEqual([{bar: 'foo'}]);
  });

  it('getProperty', () => {
    PersistentData.inject(obj, {foo: 'bar', baz: [{}, {foo: 'bar'}]});
    expect(PersistentData.getProperty(obj, 'foo')).toEqual('bar');
    expect(PersistentData.getProperty(obj, 'bar')).toBeUndefined();
    expect(PersistentData.getProperty(obj, 'baz[0].foo')).toBeUndefined();
    expect(PersistentData.getProperty(obj, 'baz[1].foo')).toEqual('bar');
  });

  it('setProperty', () => {
    let data = {};
    PersistentData.inject(obj, data);
    PersistentData.setProperty(obj, 'foo', 'bar');
    expect(data).toEqual({foo: 'bar'});
    PersistentData.setProperty(obj, 'foo', 'baz');
    PersistentData.setProperty(obj, 'bar[0].foo', 'baz');
    expect(data).toEqual({foo: 'baz', bar: [{foo: 'baz'}]});
    PersistentData.setProperty(obj, 'baz.0.bar', 'foo');
    expect(data).toEqual(
        {foo: 'baz', bar: [{foo: 'baz'}], baz: {0: {bar: 'foo'}}});
  });
});
