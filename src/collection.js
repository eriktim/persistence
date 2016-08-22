import {isCollectible} from './decorator/collectible';
import {PersistentData} from './persistent-data';

const configMap = new WeakMap();

class Collection extends Set {
  newItem() {
    let config = configMap.get(this);
    let item = new config.Type();
    PersistentData.inject(item, {});
    this.add(item);
    return item;
  }

  add(item) {
    let config = configMap.get(this);
    if (!(item instanceof config.Type)) {
      throw new TypeError(
          `collection item must be of type '${config.Type.name}'`);
    }
    let data = PersistentData.extract(item);
    config.array.push(data);
    if (!config.isExtensible) {
      Object.preventExtensions(item);
    }
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
    if (!isCollectible(Type)) {
      throw new TypeError(`collection type must be @Collectible`);
    }
    let collection = new Collection();
    configMap.set(collection, {
      Type,
      array,
      isExtensible
    });
    array.forEach(data => {
      let item = collection.newItem();
      PersistentData.inject(item, data);
    });
    return collection;
  }
}
