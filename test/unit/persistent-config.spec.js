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
    expect(PersistentConfig.get(foo)).toEqual(config, 'foo');
    expect(PersistentConfig.get(Foo)).toEqual(config, 'Foo');
    expect(PersistentConfig.get(new Proxy(Foo, {}))).toEqual(config, 'proxy');
  });

  it('has', () => {
    expect(PersistentConfig.has(foo)).toBeTruthy('foo');
    expect(PersistentConfig.has(Foo)).toBeTruthy('Foo');
    expect(PersistentConfig.has(new Proxy(Foo, {}))).toBeTruthy('proxy');
    expect(PersistentConfig.has(Object.create(null))).toBeFalsy('any');
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

  let propMap = {
    'accessorsClass': class Foo {},
    'parameters': ['bar'],
    'path': 'bar'
  };
  let propFactory = (key, value) => {
    return () => {
      let configure = () => PersistentConfig.get(foo).configureProperty(
          key, {[key]: value});
      configure();
    };
  };
  for (let key in propMap) {
    it(`configureProperty '${key}'`, propFactory(key, propMap[key]));
  }

  it(`configureProperty 'foo'`, () => {
    let configure = () => PersistentConfig.get(foo).configureProperty(
        'foo', {foo: 'bar'});
    expect(configure).toThrow();
  });
});
