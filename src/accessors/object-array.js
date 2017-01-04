import {Metadata} from '../metadata';
import {arrayHandlerFactory} from '../handler/array';
import {PersistentData} from '../persistent-data';

import {ObjectAccessors} from './object';
import {PrimitiveAccessors} from './primitive';

function arrayProxy(data: any[], Type: any, parent?: any): Proxy {
  let converter = ObjectAccessors.converterFactory(Type);
  let arr = [];
  let proxy = new Proxy(arr, arrayHandlerFactory(converter.objectToData));
  PersistentData.inject(arr, data);
  if (parent) {
    data.forEach(el => {
      let obj = converter.dataToObject(el, parent);
      arr.push(obj);
    });
  }
  return proxy;
}

export class ObjectArrayAccessors extends PrimitiveAccessors {
  get(target: PObject): any {
    if (!Reflect.hasMetadata(Metadata.COLLECTION, target, this.propertyKey)) {
      let data = super.get(target);
      if (!data) {
        data = [];
        super.setInternal(target, data);
      }
      let Type = this.parameters[0];
      let arr = arrayProxy(data, Type, target);
      Reflect.defineMetadata(Metadata.COLLECTION, arr, target, this.propertyKey);
    }
    return Reflect.getMetadata(Metadata.COLLECTION, target, this.propertyKey);
  }

  set(target: PObject, value: any): boolean {
    if (!Array.isArray(value)) {
      throw new Error('invalid array');
    }
    let Type = this.parameters[0];
    let values: any[] = value;
    if (values.find(el => !(el instanceof Type))) {
      throw new Error('invalid array element(s)');
    }
    let data = values.map(el => PersistentData.extract(el));
    super.set(target, data);
    let arr = arrayProxy(data, Type, false);
    Reflect.defineMetadata(Metadata.COLLECTION, arr, target, this.propertyKey);
    return true;
  }
}
