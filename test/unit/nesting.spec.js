// import {Embeddable} from '../../src/decorator/embeddable';
// import {Embedded} from '../../src/decorator/embedded';
// import {Entity} from '../../src/decorator/entity';
// import {Collectible} from '../../src/decorator/collectible';
// import {Collection} from '../../src/decorator/collection';
// import {Property} from '../../src/decorator/property';
// import {Config} from '../../src/config';
// import {EntityManager} from '../../src/entity-manager';
// import {VERSION} from '../../src/symbols';
// import {URL} from './helper';
//
// const VALUE = 'val';
//
// @Embeddable
// @Collectible
// class Bar {
//   @Property property;
// }
//
// @Embeddable
// @Collectible
// class Foo {
//   @Embedded(Bar) bar;
//   @Collection(Bar) bars;
//   @Property property;
// }
//
// @Entity
// class EntityClass {
//   @Embedded(Foo) foo;
//   @Collection(Foo) foos;
//   @Property property;
// }
//
// describe('Versions should cascade through collections & embedded objects', () => {
//   let obj;
//   let item;
//   let parentItem;
//   let itemOfParentItem;
//   let v0;
//   let vE0;
//   let vC0;
//   let vCE0;
//   let vCC0;
//
//   beforeEach(() => {
//     let config = Config.create({baseUrl: URL});
//     let entityManager = new EntityManager(config);
//     return entityManager.create(EntityClass)
//       .then(entityClass => {
//         obj = entityClass;
//         vE0 = obj.foo[VERSION];
//         obj.foos.newItem();
//         obj.foos.newItem();
//         let items = Array.from(obj.foos);
//         item = items.pop();
//         vC0 = item[VERSION];
//         parentItem = items.pop();
//         vCE0 = parentItem.bar[VERSION];
//         parentItem.bars.newItem();
//         parentItem.bars.newItem();
//         let itemsOfParentItem = Array.from(parentItem.bars);
//         itemOfParentItem = itemsOfParentItem.pop();
//         vCC0 = itemOfParentItem[VERSION];
//         v0 = obj[VERSION];
//       });
//   });
//
//   it('Main object', () => {
//     expect(obj[VERSION]).toBe(v0, 'v0');
//     obj.property = VALUE;
//     expect(obj[VERSION]).toBe(v0 + 1, 'v1');
//   });
//
//   it('Embedded object', () => {
//     expect(obj.foo[VERSION]).toBe(vE0, 'vE0');
//     obj.foo.property = VALUE;
//     expect(obj.foo[VERSION]).toBe(vE0 + 1, 'vE1');
//     expect(obj[VERSION]).toBe(v0 + 1, 'v1');
//   });
//
//   it('Collected object', () => {
//     expect(item[VERSION]).toBe(vC0, 'vC0');
//     obj.foos.forEach(it => it.property = VALUE);
//     expect(item[VERSION]).toBe(vC0 + 1, 'vC1');
//     expect(obj[VERSION]).toBe(v0 + 2, 'v1');
//   });
//
//   it('Collected embedded object', () => {
//     expect(item[VERSION]).toBe(vCE0, 'vCE0');
//     item.property = VALUE;
//     expect(item[VERSION]).toBe(vCE0 + 1, 'vCE1');
//     expect(obj[VERSION]).toBe(v0 + 1, 'v1');
//   });
//
//   it('Collected collected object', () => {
//     expect(itemOfParentItem[VERSION]).toBe(vCC0, 'vCC0');
//     parentItem.bars.forEach(it => it.property = VALUE);
//     expect(itemOfParentItem[VERSION]).toBe(vCC0 + 1, 'vCC1');
//     expect(obj[VERSION]).toBe(v0 + 2, 'v1');
//   });
// });
//
// @Embeddable
// class Level2 {
//   @Property property;
// }
//
// @Embeddable
// class Level1 {
//   @Embedded(Level2)
//   deeper;
//   @Property property;
// }
//
// @Entity
// class Root {
//   @Embedded(Level1)
//   deeper;
//   @Property property;
// }
//
// describe('Versions should cascade through nested embedded objects', () => {
//   let root;
//   let v0;
//   let v1;
//   let v2;
//
//   function expectDeep(...diffs) {
//     expect(root[VERSION]).toBe(v0 + diffs[0], 'v0');
//     expect(root.deeper[VERSION]).toBe(v1 + diffs[1], 'v1');
//     expect(root.deeper.deeper[VERSION]).toBe(v2 + diffs[2], 'v2');
//   }
//
//   beforeEach(() => {
//     let config = Config.create({baseUrl: URL});
//     let entityManager = new EntityManager(config);
//     return entityManager.create(Root)
//       .then(r => {
//         root = r;
//         v2 = root.deeper.deeper[VERSION];
//         v1 = root.deeper[VERSION];
//         v0 = root[VERSION];
//       });
//   });
//
//   it('Unchanged', () => {
//     expectDeep(0, 0, 0);
//   });
//
//   it('Root', () => {
//     root.property = VALUE;
//     expectDeep(1, 0, 0);
//   });
//
//   it('Deeper', () => {
//     root.deeper.property = VALUE;
//     expectDeep(1, 1, 0);
//   });
//
//   it('Deepest', () => {
//     root.deeper.deeper.property = VALUE;
//     expectDeep(1, 1, 1);
//   });
// });
