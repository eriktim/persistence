import {isEmbeddable} from './embeddable';
import {EntityConfig} from '../entity-config';
import {PersistentData} from '../persistent-data';
import {Util} from '../util';

const embeddedDataMap = new WeakMap();

function getEmbeddedDataFactory(Type, path, getter) {
  return function(target, propertyKey) {
    if (!embeddedDataMap.has(target)) {
      embeddedDataMap.set(target, new Map());
    }
    const embeddedData = embeddedDataMap.get(target);
    if (!embeddedData.has(propertyKey)) {
      let data = Reflect.apply(getter, target, []) || {};
      if (!Util.isObject(data)) {
        throw new Error('embedded data is corrupt');
      }
      let type = new Type();
      if (!Object.isExtensible(target)) {
        Object.preventExtensions(type);
      }
      PersistentData.inject(type, data);
      PersistentData.setProperty(target, path, data);
      embeddedData.set(propertyKey, type);
    }
    return embeddedData.get(propertyKey);
  };
}

export function Embedded(Type) {
  let isDecorator = Util.isPropertyDecorator(...arguments);
  if (isDecorator) {
    throw new Error('@Embedded requires a type');
  }
  if (!isEmbeddable(Type)) {
    throw new Error('embedded object is not embeddable');
  }
  return function(target, propertyKey) {
    let config = EntityConfig.get(target).getProperty(propertyKey);
    let getEmbeddedData = getEmbeddedDataFactory(
        Type, config.fullPath, config.getter);
    config.configure({
      getter: function() {
        return getEmbeddedData(this, propertyKey);
      },
      setter: function() {
        throw new Error('cannot override embedded object');
      }
    });
  };
}
