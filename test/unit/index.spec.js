import * as allIndex from '../../src/index';

let index = {};
Object.assign(index, allIndex);

const exports = [
  'Collectible',
  'Collection',
  'Config',
  'Embeddable',
  'Embedded',
  'Entity',
  'EntityManager',
  'Id',
  'ManyToOne',
  'OneToOne',
  'PostLoad',
  'PostPersist',
  'PostRemove',
  'PrePersist',
  'PreRemove',
  'Property',
  'Temporal',
  'TemporalFormat',
  'Transient'
];

describe('Index', () => {
  it('Exports', () => {
    expect(Object.keys(index).length).toEqual(exports.length);
    exports.forEach(exp => {
      expect(exp in index).toBeTruthy();
      Reflect.deleteProperty(index, exp);
    });
    expect(Object.keys(index).length).toEqual(0);
  });
});
