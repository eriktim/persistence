import {Metadata} from '../metadata';
import {PersistentData} from '../persistent-data';
import {PersistentObject} from '../persistent-object';

import {PrimitiveAccessors} from './primitive';

export class ObjectAccessors extends PrimitiveAccessors {
  static converterFactory(Type: any) {
    return {
      dataToObject: function(data: any, parent: any) {
        let obj = new Type();
        PersistentObject.apply(obj, data, parent);
        return obj;
      },
      objectToData: function(obj: any) {
        if (!(obj instanceof Type)) {
          throw new Error('invalid object type');
        }
        return PersistentData.extract(obj);
      }
    };
  }

  converter;

  constructor(...rest) {
    super(...rest);
    let Type = this.parameters[0];
    this.converter = ObjectAccessors.converterFactory(Type);
  }

  get(target: PObject): any {
    if (!Reflect.hasMetadata(Metadata.EMBEDDED, target, this.propertyKey)) {
      let data = super.get(target);
      if (!data) {
        data = Object.create(null);
        super.setInternal(target, data);
      }
      let obj = this.converter.dataToObject(data, target);
      Reflect.defineMetadata(Metadata.EMBEDDED, obj, target, this.propertyKey);
    }
    return Reflect.getMetadata(Metadata.EMBEDDED, target, this.propertyKey);
  }

  set(target: PObject, obj: any): boolean {
    let data = this.converter.objectToData(obj);
    super.set(target, data);
    Reflect.defineMetadata(Metadata.EMBEDDED, obj, target, this.propertyKey);
    return true;
  }
}
