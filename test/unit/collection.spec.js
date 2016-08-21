import {CollectionFactory} from '../../src/collection';

describe('Collection', () => {
  class Foo {}
  let collection;
  let data;

  beforeEach(() => {
    data = [];
    collection = CollectionFactory.create(Foo, data);
  });

  it('Set', () => {
    expect(collection).toEqual(jasmine.any(Set));
  });

  it('size', () => {
    expect(collection.size).toEqual(0);
    let item = collection.create();
    expect(collection.size).toEqual(1);
    collection.add({});
    expect(collection.size).toEqual(2);
    collection.delete(item);
    expect(collection.size).toEqual(1);
    collection.clear();
    expect(collection.size).toEqual(0);
  });

  it('create', () => {
    expect(data).toEqual([]);
    collection.create();
    expect(data).toEqual([{}]);
    collection.create();
    expect(data).toEqual([{}, {}]);
  });

  it('add', () => {
    expect(data).toEqual([]);
    collection.add({foo: 'bar'});
    expect(data).toEqual([{foo: 'bar'}]);
    collection.add({foo: 'baz'});
    expect(data).toEqual([{foo: 'bar'}, {foo: 'baz'}]);
  });

  it('clear', () => {
    collection.create();
    collection.create();
    expect(data).toEqual([{}, {}]);
    collection.clear();
    expect(data).toEqual([]);
  });

  it('delete', () => {
    collection.add({foo: 'bar'});
    let item = collection.create();
    collection.add({foo: 'baz'});
    expect(data).toEqual([{foo: 'bar'}, {}, {foo: 'baz'}]);
    collection.delete(item);
    expect(data).toEqual([{foo: 'bar'}, {foo: 'baz'}]);
  });

  it('iterate', () => {
    collection.create();
    collection.create();
    for (let item of collection) {
      expect(item).toEqual(jasmine.any(Foo));
    }
  });
});
