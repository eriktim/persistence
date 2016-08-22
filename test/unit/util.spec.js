import {Util} from '../../src/util';

function decorate(target, propertyName, supDescriptor, infDescriptor = null) {
  if (!infDescriptor) {
    infDescriptor = Object.getOwnPropertyDescriptor(target, propertyName) || {};
  }
  let descriptor = Util.mergeDescriptors(infDescriptor, supDescriptor);
  return Reflect.defineProperty(target, propertyName, descriptor);
}

describe('Util', () => {
  class Foo {}
  let foo = new Foo();

  it('Merge descriptors', () => {
    expect('bar' in foo).toBeFalsy();
    decorate(foo, 'bar', {});
    expect('bar' in foo).toBeTruthy();

    let setter = jasmine.createSpy('setter');
    let getter = jasmine.createSpy('getter');
    decorate(foo, 'bar', {set: setter, get: getter});
    foo.bar = 'a';
    expect(setter).toHaveBeenCalledWith('a');
    foo.bar;
    expect(getter).toHaveBeenCalledTimes(1);

    let newSetter = jasmine.createSpy('newSetter');
    let newGetter = jasmine.createSpy('newGetter');
    decorate(foo, 'bar', {set: newSetter, get: newGetter});
    foo.bar = 'b';
    expect(setter).toHaveBeenCalledWith('b');
    expect(newSetter).toHaveBeenCalledWith('b');
    foo.bar;
    expect(getter).toHaveBeenCalledTimes(2);
    expect(newGetter).toHaveBeenCalledTimes(1);
  });

  it('getClass', () => {
    expect(Util.getClass(Foo)).toEqual(Foo);
    expect(Util.getClass(foo)).toEqual(Foo);
    expect(Util.getClass(new Proxy(Foo, {}))).toEqual(Foo);
    expect(() => Util.getClass('Bar')).toThrowError(
        'target must be an instance or class');
  });

  it('is', () => {
    let util = Util.is;
    expect(util(undefined)).toEqual(false, 'undefined');
    expect(util(null)).toEqual(false, 'null');
    expect(util(0)).toEqual(true, '0');
    expect(util({})).toEqual(true, '{}');
    expect(util('')).toEqual(true, '\'\'');
    expect(util([])).toEqual(true, '[]');
    expect(util(Foo)).toEqual(true, 'Foo');
    expect(util(foo)).toEqual(true, 'foo');
  });

  it('isClassDecorator', () => {
    let util = Util.isClassDecorator;
    expect(util(Foo)).toEqual(true, 'Foo');
    expect(util(foo)).toEqual(false, 'foo');
    expect(util()).toEqual(false, 'no args');
    expect(util(Foo, 'bar')).toEqual(false, '2 args');
  });

  it('isClass', () => {
    let util = Util.isClass;
    expect(util(undefined)).toEqual(false, 'undefined');
    expect(util(null)).toEqual(false, 'null');
    expect(util(0)).toEqual(false, '0');
    expect(util({})).toEqual(false, '{}');
    expect(util('')).toEqual(false, '""');
    expect(util([])).toEqual(false, '[]');
    expect(util(Foo)).toEqual(true, 'Foo');
    expect(util(foo)).toEqual(false, 'foo');
  });

  it('isObject', () => {
    let util = Util.isObject;
    expect(util(undefined)).toEqual(false, 'undefined');
    expect(util(null)).toEqual(false, 'null');
    expect(util(0)).toEqual(false, '0');
    expect(util({})).toEqual(true, '{}');
    expect(util('')).toEqual(false, '""');
    expect(util([])).toEqual(false, '[]');
    expect(util(Foo)).toEqual(false, 'Foo');
    expect(util(foo)).toEqual(true, 'foo');
  });

  it('isPropertyDecorator', () => {
    let util = Util.isPropertyDecorator;
    expect(util(foo, 'bar', {})).toEqual(true, 'obj, str, obj');
    expect(util(Foo, 'bar', {})).toEqual(false, 'fnc, str, obj');
    expect(util(foo, {}, {})).toEqual(false, 'obj, obj, obj');
    expect(util(foo, 'bar', 'baz')).toEqual(false, 'obj, str, str');
    expect(util()).toEqual(false, 'no args');
    expect(util(foo)).toEqual(false, '1 arg');
    expect(util(foo, 'bar')).toEqual(false, '2 args');
    expect(util(foo, 'bar', {}, {})).toEqual(false, '4 args');
  });
});
