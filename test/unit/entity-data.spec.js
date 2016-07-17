import {EntityData, VERSION} from '../../src/entity-data';

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
    EntityData.inject(obj, {foo: 'bar', baz: [{}, {foo: 'bar'}]});
    expect(obj[VERSION]).toEqual(1);
    expect(EntityData.getProperty(obj, 'foo')).toEqual('bar');
    expect(EntityData.getProperty(obj, 'bar')).toBeUndefined();
    expect(EntityData.getProperty(obj, 'baz[0].foo')).toBeUndefined();
    expect(EntityData.getProperty(obj, 'baz[1].foo')).toEqual('bar');
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
    EntityData.setProperty(obj, 'bar[0].foo', 'baz');
    expect(data).toEqual({foo: 'baz', bar: [{foo: 'baz'}]});
    expect(obj[VERSION]).toEqual(4);
    EntityData.setProperty(obj, 'baz.0.bar', 'foo');
    expect(data).toEqual(
        {foo: 'baz', bar: [{foo: 'baz'}], baz: {0: {bar: 'foo'}}});
    expect(obj[VERSION]).toEqual(5);
  });
});
