import {Entity as entityDecorator} from './decorator/entity';
import {EntityConfig} from './entity-config';
import {PersistentData} from './persistent-data';

const configMap = new WeakMap();

class Collection extends Set {
  create() {
    this.add({});
    return Array.from(this).pop();
  }

  add(data) {
    let config = configMap.get(this);
    let item = new config.Type();
    if (!config.isExtensible) {
      Object.preventExtensions(item);
    }
    PersistentData.inject(item, data);
    config.array.push(data);
    super.add(item);
    return this;
  }

  clear() {
    let config = configMap.get(this);
    config.array.splice(0, config.array.length);
    super.clear();
  }

  delete(item) {
    let config = configMap.get(this);
    let data = PersistentData.extract(item);
    let index = config.array.indexOf(data);
    config.array.splice(index, 1);
    return super.delete(item);
  }
}

export class CollectionFactory {
  static create(Type, array, isExtensible) {
    let collection = new Collection();
    configMap.set(collection, {
      Type,
      array,
      isExtensible
    });
    array.forEach(data => {
      let item = collection.create();
      PersistentData.inject(item, data);
    });
    return collection;
  }
}
