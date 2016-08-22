import {CollectionFactory} from '../../src/collection';
import {Collectible} from '../../src/decorator/collectible';

describe('Collection', () => {
  @Collectible class Foo {
    prop = undefined;
  }
  let collection;
  let data;

  beforeEach(() => {
    data = [];
    collection = CollectionFactory.create(Foo, data);
  });

  it('Collectible', () => {
    class Bar {}
    expect(() => CollectionFactory.create(Bar, [])).toThrowError(
        'collection type must be @Collectible');
  });

  it('Set', () => {
    expect(collection).toEqual(jasmine.any(Set));
  });

  it('size', () => {
    expect(collection.size).toEqual(0);
    let item = collection.newItem();
    expect(collection.size).toEqual(1);
    collection.add(new Foo());
    expect(collection.size).toEqual(2);
    collection.delete(item);
    expect(collection.size).toEqual(1);
    collection.clear();
    expect(collection.size).toEqual(0);
  });

  it('newItem', () => {
    expect(data).toEqual([]);
    collection.newItem();
    expect(data).toEqual([{}]);
    collection.newItem();
    expect(data).toEqual([{}, {}]);
  });

  it('add', () => {
    expect(data).toEqual([]);
    collection.add(new Foo());
    expect(() => collection.add({})).toThrowError(
        `collection item must be of type 'Foo'`);
    expect(data).toEqual([{}]);
    let item = new Foo();
    item.prop = 'bar';
    collection.add(item);
    expect(data).toEqual([{}, {prop: 'bar'}]);
  });

  it('clear', () => {
    collection.newItem();
    collection.newItem();
    expect(data).toEqual([{}, {}]);
    collection.clear();
    expect(data).toEqual([]);
  });

  it('delete', () => {
    let item1 = collection.newItem();
    let item2 = collection.newItem();
    let item3 = collection.newItem();
    expect(Array.from(collection)).toEqual([item1, item2, item3]);
    collection.delete(item2);
    expect(Array.from(collection)).toEqual([item1, item3]);
  });

  it('iterate', () => {
    collection.newItem();
    collection.newItem();
    for (let item of collection) {
      expect(item).toEqual(jasmine.any(Foo));
    }
  });
});
