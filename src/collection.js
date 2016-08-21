import {Entity as entityDecorator} from './decorator/entity';
import {EntityConfig} from './entity-config';
import {PersistentData} from './persistent-data';

const arrayMap = new WeakMap();
const typeMap = new WeakMap();

class Collection extends Set {
  create() {
    this.add({});
    return Array.from(this).pop();
  }

  add(data) {
    let Type = typeMap.get(this);
    let item = new Type();
    PersistentData.inject(item, data);
    arrayMap.get(this).push(data);
    super.add(item);
    return this;
  }

  clear() {
    let array = arrayMap.get(this);
    array.splice(0, array.length);
    super.clear();
  }

  delete(item) {
    let array = arrayMap.get(this);
    let data = PersistentData.extract(item);
    let index = array.indexOf(data);
    array.splice(index, 1);
    return super.delete(item);
  }
}

export class CollectionFactory {
  static create(Type, array) {
    if (!EntityConfig.has(Type)) { // FIXME should be handled in function call
      entityDecorator()(Type);
    }
    let collection = new Collection();
    typeMap.set(collection, Type);
    arrayMap.set(collection, array);
    array.forEach(data => {
      let item = collection.create();
      PersistentData.inject(item, data);
    });
    return collection;
  }
}
