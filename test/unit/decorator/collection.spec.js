// import {Collectible} from '../../../src/decorator/collectible';
// import {Collection} from '../../../src/decorator/collection';
// import {Entity} from '../../../src/decorator/entity';
// import {Id} from '../../../src/decorator/id';
// import {Property} from '../../../src/decorator/property';
// import {getArrayForTesting} from '../../../src/collection';
// import {PersistentData} from '../../../src/persistent-data';
// import {VERSION} from '../../../src/symbols';
// import {createEntityManagerStub, expectRejection} from '../helper';
//
// @Collectible
// class Bar {
//   @Property baz;
// }
//
// @Entity class Foo {
//   @Id
//   key;
//
//   @Collection(Bar)
//   bars;
// }
//
// describe('@Collection', () => {
//   let entityManager;
//
//   beforeEach(() => {
//     entityManager = createEntityManagerStub();
//   });
//
//   it('Empty', () => {
//     return entityManager.create(Foo, {}).then(foo => {
//       expect(foo.bars.size).toEqual(0);
//       let bar = foo.bars.newItem();
//       expect(bar).toEqual(jasmine.any(Bar));
//       bar.baz = 'boo';
//       expect(bar.baz).toEqual('boo');
//       expect(PersistentData.extract(foo)).toEqual({bars: [{baz: 'boo'}]});
//     });
//   });
//
//   it('Non-empty', () => {
//     return entityManager.create(Foo, {bars: [{baz: 'boz'}]}).then(foo => {
//       expect(foo.bars.size).toEqual(1);
//       let bar = Array.from(foo.bars).pop();
//       expect(bar).toEqual(jasmine.any(Bar));
//       expect(bar.baz).toEqual('boz');
//     });
//   });
//
//   it('Invalid', () => {
//     return expectRejection(entityManager.create(Foo, {bars: 'bars'}),
//         'collection data is corrupt');
//   });
//
//   it('Non-writable', () => {
//     return entityManager.create(Foo, {}).then(foo => {
//       expect(() => foo.bars = 'bars')
//         .toThrowError('cannot override collection');
//     });
//   });
//
//   it('Versions', () => {
//     return entityManager.create(Foo, {}).then(foo => {
//       expect(foo[VERSION]).toEqual(1);
//       let item = foo.bars.newItem();
//       expect(foo[VERSION]).toEqual(3);
//       foo.bars.delete(item);
//       expect(foo[VERSION]).toEqual(4);
//       foo.bars.add(item);
//       expect(foo[VERSION]).toEqual(5);
//       foo.bars.clear();
//       expect(foo[VERSION]).toEqual(6);
//     });
//   });
//
//   it('Keep references', () => {
//     return entityManager.create(Foo, {}).then(foo => {
//       let bars = foo.bars;
//       bars.newItem();
//       expect(PersistentData.isDirty(foo)).toBe(true);
//       expect(PersistentData.extract(foo).bars)
//         .toBe(getArrayForTesting(foo.bars), 'before persistence');
//       return entityManager.persist(foo).then(() => {
//         expect(PersistentData.extract(foo).bars)
//           .toBe(getArrayForTesting(foo.bars), 'after persistence');
//         expect(foo.bars).toBe(bars);
//       });
//     });
//   });
// });
