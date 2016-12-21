// import {Collectible} from '../../../src/decorator/collectible';
// import {Entity} from '../../../src/decorator/entity';
// import {Id} from '../../../src/decorator/id';
// import {createEntityManagerStub} from '../helper';
//
// describe('@Collectible', () => {
//   let entityManager;
//
//   beforeEach(() => {
//     entityManager = createEntityManagerStub();
//   });
//
//   it('Undecorated', () => {
//     class Foo {}
//     expect(Foo.isCollectible).toBeFalsy();
//   });
//
//   it('Entity', () => {
//     @Entity class Foo {
//       @Id id;
//     }
//     expect(Foo.isCollectible).toBeFalsy();
//     return entityManager.create(Foo, {});
//   });
//
//   it('noFactory', () => {
//     @Collectible class Foo {}
//     expect(Foo.isCollectible).toEqual(true);
//   });
//
//   it('default', () => {
//     @Collectible() class Foo {}
//     expect(Foo.isCollectible).toEqual(true);
//   });
// });
