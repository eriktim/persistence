import {Metadata} from '../metadata';
import {PersistentObject} from '../persistent-object';

import {PrimitiveAccessors} from './primitive';

export class ObjectAccessors extends PrimitiveAccessors {
  get(target: PObject): any {
    if (!Reflect.hasMetadata(Metadata.OBJECT_REF, target, this.propertyKey)) {
      let data = super.get(target);
      if (!data) {
        data = Object.create(null);
        super.setInternal(target, data);
      }
      let obj = this.mapper.fromData(target, data);
      Reflect.defineMetadata(Metadata.OBJECT_REF, obj, target, this.propertyKey);
    }
    return Reflect.getMetadata(Metadata.OBJECT_REF, target, this.propertyKey);
  }

  set(target: PObject, obj: any): boolean {
    if (this.mapper.unlink) {
      const prevObj = Reflect.getMetadata(Metadata.OBJECT_REF, target, this.propertyKey);
      if (prevObj) {
        this.mapper.unlink(target, prevObj);
      }
    }
    let data = this.mapper.toData(target, obj);
    if (data instanceof Promise) {
      data.then(d => super.set(target, d));
      obj = Promise.resolve(obj);
    } else {
      super.set(target, data);
    }
    Reflect.defineMetadata(Metadata.OBJECT_REF, obj, target, this.propertyKey);
    return true;
  }
}
