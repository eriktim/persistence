import {PersistentConfig} from '../../src/persistent-config';

describe('PersistentConfig', () => {
  class Foo {}
  let foo;
  let config;

  beforeEach(() => {
    foo = new Foo();
    config = PersistentConfig.get(foo);
  });

  it('get', () => {
    expect(PersistentConfig.get(foo)).toEqual(config);
    expect(PersistentConfig.get(Foo)).toEqual(config);
    expect(PersistentConfig.get(new Proxy(Foo, {}))).toEqual(config);
  });

  it('has', () => {
    expect(PersistentConfig.has(foo)).toBeTruthy();
    expect(PersistentConfig.has(Foo)).toBeTruthy();
    expect(PersistentConfig.has(new Proxy(Foo, {}))).toBeTruthy();
    expect(PersistentConfig.has({})).toBeFalsy();
  });

  let keys = [
    'cacheOnly',
    'idKey',
    'path',
    'postLoad',
    'postPersist',
    'postRemove',
    'postUpdate',
    'preLoad',
    'prePersist',
    'preRemove',
    'preUpdate'
  ];
  let factory = key => {
    let index = 1;
    return () => {
      let configure = () => PersistentConfig.get(foo).configure({[key]: 'foo' + index++});
      configure();
    };
  };
  for (let key of keys) {
    it(`configure '${key}'`, factory(key));
  }

  it(`configure 'propertyMap'`, () => {
    let configure = () => PersistentConfig.get(foo).configure({propertyMap: {}});
    expect(configure).toThrow();
  });

  it(`configure 'foo'`, () => {
    let configure = () => PersistentConfig.get(foo).configure({foo: 'bar'});
    expect(configure).toThrow();
  });

  let propKeys = [
    'getter',
    'path',
    'setter',
    'type'
  ];
  let propFactory = key => {
    return () => {
      let configure = () => PersistentConfig.get(foo).configureProperty(
          key, {[key]: 'bar'});
      configure();
    };
  };
  for (let key of propKeys) {
    it(`configureProperty '${key}'`, propFactory(key));
  }

  it(`configureProperty 'foo'`, () => {
    let configure = () => PersistentConfig.get(foo).configureProperty(
        'foo', {foo: 'bar'});
    expect(configure).toThrow();
  });
});
