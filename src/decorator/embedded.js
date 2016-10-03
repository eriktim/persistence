import {isEmbeddable} from './embeddable';
import {PersistentConfig, PropertyType} from '../persistent-config';
import {PersistentObject} from '../persistent-object';
import {Util} from '../util';

const embeddedDataMap = new WeakMap();

function getEmbeddedDataFactory(Type, getter, setter) {
  return function(target, propertyKey) {
    if (!embeddedDataMap.has(target)) {
      embeddedDataMap.set(target, new Map());
    }
    const embeddedData = embeddedDataMap.get(target);
    if (!embeddedData.has(propertyKey)) {
      let data = Reflect.apply(getter, target, []);
      if (data === undefined) {
        data = {};
        Reflect.apply(setter, target, [data]);
      }
      if (!Util.isObject(data)) {
        throw new Error('embedded data is corrupt');
      }
      let type = new Type();
      PersistentObject.apply(type, data, target);
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
    throw new TypeError('embedded object is not embeddable');
  }
  return function(target, propertyKey) {
    let config = PersistentConfig.get(target).getProperty(propertyKey);
    let getEmbeddedData = getEmbeddedDataFactory(
        Type, config.getter, config.setter);
    config.configure({
      type: PropertyType.EMBEDDED,
      getter: function() {
        return getEmbeddedData(this, propertyKey);
      },
      setter: function() {
        throw new Error('cannot override embedded object');
      }
    });
  };
}
