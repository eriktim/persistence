import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {Property} from '../../../src/decorator/property';
import {PersistentData} from '../../../src/persistent-data';
import {createEntityManagerStub} from '../helper';

@Entity
class Foo {
  @Id
  key;

  undecorated = undefined;

  @Property
  unnamed;

  @Property()
  empty;

  @Property('nameOfNamed')
  named;

  @Property('some.path')
  path;

  @Property('array[1].item')
  array;

  @Property('arrayInArray[0][0].obj')
  arrayInArray;

  @Property('arrayValue[0]')
  arrayValue;

  @Property('arrayInArrayValue[0][0]')
  arrayInArrayValue;
}

describe('@Property', () => {
  let entityManager;
  let data;

  beforeEach(() => {
    entityManager = createEntityManagerStub();
    return entityManager.create(Foo, {}).then(foo => {
      for (let prop in foo) {
        foo[prop] = 1;
      }
      data = PersistentData.extract(foo);
    });
  });

  it('Save', () => {
    expect('undecorated' in data).toBeTruthy('undecorated');
    expect('unnamed' in data).toBeTruthy('unnamed');
    expect('empty' in data).toBeTruthy('empty');
    expect('named' in data).toBeFalsy('named');
    expect('nameOfNamed' in data).toBeTruthy('nameOfNamed');
    expect('some' in data).toBeTruthy('some');
    expect('path' in data.some).toBeTruthy('path');
    expect('array' in data).toBeTruthy('array');
    expect(data.array.length).toEqual(2);
    expect(data.array[0]).toBeUndefined();
    expect('item' in data.array[1]).toBeTruthy('item');
    expect('arrayInArray' in data).toBeTruthy('arrayInArray');
    expect(data.arrayInArray.length).toEqual(1);
    expect(data.arrayInArray[0].length).toEqual(1);
    expect('obj' in data.arrayInArray[0][0]).toBeTruthy('obj');
    expect('arrayValue' in data).toBeTruthy('arrayValue');
    expect(data.arrayValue.length).toEqual(1);
    expect('arrayInArrayValue' in data).toBeTruthy('arrayInArrayValue');
    expect(data.arrayInArrayValue.length).toEqual(1);
    expect(data.arrayInArrayValue[0].length).toEqual(1);
  });

  it('Advanced indices', () => {
    @Entity class Bar {
      @Property('elements[key=bad][0]')
      badProperty;

      @Property('elements[0].value')
      property1;

      @Property('elements[key=code2].value')
      property2;

      @Property('elements[value=three].value')
      property3;

      @Property('elements[key=code4,value=four].value')
      property4;

      @Property('elements[key=code.5].value')
      property5;
    }
    let elements = [{
      key: 'code1',
      value: 'one'
    }, {
      key: 'code2',
      value: 'two'
    }, {
      key: 'code3',
      value: 'three'
    }, {
      key: 'code4',
      value: 'four'
    }, {
      key: 'code.5',
      value: 'five'
    }];
    return entityManager.create(Bar, {elements}).then(bar => {
      let data = PersistentData.extract(bar);
      expect(() => bar.badProperty)
          .toThrowError('invalid array index: elements[key=bad][0]');
      expect(data.elements.length).toBe(5);
      expect(data.elements[0].key).toBe('code1');
      expect(data.elements[1].key).toBe('code2');
      expect(data.elements[2].key).toBe('code3');
      expect(data.elements[3].key).toBe('code4');
      expect(data.elements[4].key).toBe('code.5');
      expect(bar.property1).toBe('one');
      expect(bar.property2).toBe('two');
      expect(bar.property3).toBe('three');
      expect(bar.property4).toBe('four');
      expect(bar.property5).toBe('five');
    });
  });
});
