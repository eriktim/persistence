import {Entity} from '../../../src/decorator/entity';
import {Id} from '../../../src/decorator/id';
import {Property} from '../../../src/decorator/property';
import {PersistentData} from '../../../src/persistent-data';
import {createEntityManagerStub} from '../helper';

@Entity()
class Foo {
  @Id()
  key;

  undecorated = undefined;

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

  @Property('arrayAndArrayValue[0].arrayKey[0]')
  arrayAndArrayValue;
}

describe('@Property()', () => {
  let entityManager;
  let data;

  beforeEach(() => {
    entityManager = createEntityManagerStub();
    return entityManager.create(Foo, {key: '123'}).then(foo => {
      for (let prop in foo) {
        if (prop === 'key') {
          continue;
        }
        foo[prop] = prop;
      }
      data = PersistentData.extract(foo);
    });
  });

  it('Save', () => {
    expect(data.key).toEqual('123');
    expect(data.undecorated).toBeUndefined();
    expect(data.empty).toEqual('empty');
    expect(data.nameOfNamed).toEqual('named');
    expect(data.some).toEqual({path: 'path'});
    expect(data.array).toEqual([undefined, {item: 'array'}]);
    expect(data.arrayInArray).toEqual([[{obj: 'arrayInArray'}]]);
    expect(data.arrayValue).toEqual(['arrayValue']);
    expect(data.arrayInArrayValue).toEqual([['arrayInArrayValue']]);
    expect(data.arrayAndArrayValue).toEqual([{arrayKey: ['arrayAndArrayValue']}]);
  });

  it('Advanced indices', () => {
    @Entity() class Bar {
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
    let data = {elements};
    return entityManager.create(Bar, data).then(bar => {
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

  it('JSON indices', () => {
    const SYSTEM = 'http://hl7.org';
    @Entity() class Resource {
      @Property(`component[{"code":{"coding":[{"system":"${SYSTEM}","code":123}]}}].valueString`)
      property;

      @Property(`coding[{"system":"${SYSTEM}","code":123,"(display)":"Default display"}].version`)
      initializedOptional;

      @Property(`coding[{"system":"${SYSTEM}","code":456,"(display)":"Default display"}].version`)
      uninitializedOptional;
    }
    let coding = {
      system: SYSTEM,
      code: 123
    };
    let data = {
      component: [{
        code: {
          coding: [Object.assign({}, coding)]
        },
        valueString: 'foo'
      }],
      coding: [Object.assign({}, coding, {display: 'Persisted display', version: 1})]
    };
    return entityManager.create(Resource, data).then(resource => {
      expect(resource.property).toBe('foo');
      expect(resource.initializedOptional).toBe(1);
      expect(resource.uninitializedOptional).toBeUndefined();
      resource.uninitializedOptional = 2;
      expect(resource.uninitializedOptional).toBe(2);
      expect(data).toEqual({
        component: [{
          code: {
            coding: [{
              system: SYSTEM,
              code: 123
            }]
          },
          valueString: 'foo'
        }],
        coding: [{
          system: SYSTEM,
          code: 123,
          display: 'Persisted display',
          version: 1
        }, {
          system: SYSTEM,
          code: 456,
          display: 'Default display',
          version: 2
        }]
      });
    });
  });
});
