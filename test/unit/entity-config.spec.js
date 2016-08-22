import {EntityConfig} from '../../src/entity-config';

describe('EntityConfig', () => {
  class Foo {}
  let foo;
  let config;

  beforeEach(() => {
    foo = new Foo();
    config = EntityConfig.get(foo);
  });

  it('get', () => {
    expect(EntityConfig.get(foo)).toEqual(config);
    expect(EntityConfig.get(Foo)).toEqual(config);
    expect(EntityConfig.get(new Proxy(Foo, {}))).toEqual(config);
  });

  it('has', () => {
    expect(EntityConfig.has(foo)).toBeTruthy();
    expect(EntityConfig.has(Foo)).toBeTruthy();
    expect(EntityConfig.has(new Proxy(Foo, {}))).toBeTruthy();
    expect(EntityConfig.has({})).toBeFalsy();
  });

  let keys = [
    'idKey',
    'path',
    'postLoad',
    'postPersist',
    'postRemove',
    'preLoad',
    'prePersist',
    'preRemove'
  ];
  let factory = key => {
    return () => {
      let configure = () => EntityConfig.get(foo).configure({[key]: 'foo'});
      configure();
      expect(configure).toThrow();
    };
  };
  for (let key of keys) {
    it(`configure '${key}'`, factory(key));
  }

  it(`configure 'propertyMap'`, () => {
    let configure = () => EntityConfig.get(foo).configure({propertyMap: {}});
    expect(configure).toThrow();
  });

  it(`configure 'foo'`, () => {
    let configure = () => EntityConfig.get(foo).configure({foo: 'bar'});
    expect(configure).toThrow();
  });

  let propKeys = [
    'getter',
    'path',
    'setter',
    'transient'
  ];
  let propFactory = key => {
    return () => {
      let configure = () => EntityConfig.get(foo).configureProperty(
          key, {[key]: 'bar'});
      configure();
    };
  };
  for (let key of propKeys) {
    it(`configureProperty '${key}'`, propFactory(key));
  }

  it(`configureProperty 'foo'`, () => {
    let configure = () => EntityConfig.get(foo).configureProperty(
        'foo', {foo: 'bar'});
    expect(configure).toThrow();
  });
});
