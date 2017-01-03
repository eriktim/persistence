import {Metadata} from '../metadata';
import {PersistentData} from '../persistent-data';
import {PersistentObject} from '../persistent-object';

import {PrimitiveAccessors} from './primitive';

export class ObjectAccessors extends PrimitiveAccessors {
  get(target: PObject): any {
    if (!Reflect.hasMetadata(Metadata.EMBEDDED, target, this.propertyKey)) {
      let Type = this.parameters[0];
      let data = super.get(target);
      if (!data) {
        data = Object.create(null);
        super.setInternal(target, data);
      }
      let obj = new Type();
      PersistentObject.apply(obj, data, target);
      Reflect.defineMetadata(Metadata.EMBEDDED, obj, target, this.propertyKey);
    }
    return Reflect.getMetadata(Metadata.EMBEDDED, target, this.propertyKey);
  }

  set(target: PObject, obj: any): boolean {
    let Type = this.parameters[0];
    if (!(obj instanceof Type)) {
      throw new Error('invalid object type');
    }
    let data = PersistentData.extract(obj);
    super.set(target, data);
    Reflect.defineMetadata(Metadata.EMBEDDED, obj, target, this.propertyKey);
    return true;
  }
}
