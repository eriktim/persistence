import {Metadata} from '../metadata';
import {arrayHandlerFactory} from '../handler/array';
import {PersistentData} from '../persistent-data';
import {PersistentObject} from '../persistent-object';

import {PrimitiveAccessors} from './primitive';

function arrayProxy(data: any[], mapper: IMapper, parent?: any): Proxy {
  let arr = [];
  let proxy = new Proxy(arr, arrayHandlerFactory(mapper));
  PersistentObject.apply(arr, data, parent);
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
    if (!Reflect.hasMetadata(Metadata.ARRAY_REF, target, this.propertyKey)) {
      let data = super.get(target);
      if (!data) {
        data = [];
        super.setInternal(target, data);
      }
      let arr = arrayProxy(data, this.mapper, target);
      Reflect.defineMetadata(Metadata.ARRAY_REF, arr, target, this.propertyKey);
    }
    return Reflect.getMetadata(Metadata.ARRAY_REF, target, this.propertyKey);
  }

  set(target: PObject, value: any): boolean {
    if (!Array.isArray(value)) {
      throw new Error('invalid array');
    }
    let values: any[] = value;
    let data = values.map(el => PersistentData.extract(el));
    super.set(target, data);
    let arr = arrayProxy(data, this.mapper, false);
    Reflect.defineMetadata(Metadata.ARRAY_REF, arr, target, this.propertyKey);
    return true;
  }
}
