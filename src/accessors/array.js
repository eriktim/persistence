import {Metadata} from '../metadata';
import {arrayHandlerFactory} from '../handler/array';
import {PersistentData} from '../persistent-data';

import {PrimitiveAccessors} from './primitive';

function arrayProxy(data: any[], mapper: IMapper, parent?: any): Proxy {
  let arr = [];
  let proxy = new Proxy(arr, arrayHandlerFactory(mapper));
  PersistentData.inject(arr, data);
  if (parent) {
    data.forEach(item => {
      let obj = mapper.fromData(parent, item);
      arr.push(obj);
    });
  }
  return proxy;
}

export class ArrayAccessors extends PrimitiveAccessors {
  get(target: PObject): any {
    if (!Reflect.hasMetadata(Metadata.COLLECTION, target, this.propertyKey)) {
      let data = super.get(target);
      if (!data) {
        data = [];
        super.setInternal(target, data);
      }
      let mapper = this.parameters[1];
      let arr = arrayProxy(data, mapper, target);
      Reflect.defineMetadata(Metadata.COLLECTION, arr, target, this.propertyKey);
    }
    return Reflect.getMetadata(Metadata.COLLECTION, target, this.propertyKey);
  }

  set(target: PObject, value: any): boolean {
    if (!Array.isArray(value)) {
      throw new Error('invalid array');
    }
    let [Type, mapper] = this.parameters;
    let values: any[] = value;
    if (values.find(el => !(el instanceof Type))) {
      throw new Error('invalid array element(s)');
    }
    let data = values.map(el => PersistentData.extract(el));
    super.set(target, data);
    let arr = arrayProxy(data, mapper, false);
    Reflect.defineMetadata(Metadata.COLLECTION, arr, target, this.propertyKey);
    return true;
  }
}
