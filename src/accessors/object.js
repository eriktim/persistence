import {Metadata} from '../metadata';
import {PersistentData} from '../persistent-data';
import {PersistentObject} from '../persistent-object';

import {PrimitiveAccessors} from './primitive';

export class ObjectMapper implements IMapper {
  objClass: any;

  constructor(objClass: any) {
    this.objClass = objClass;
  }

  fromData(target: PObject, data: any): Promise<any> {
    let obj = new this.objClass();
    PersistentObject.apply(obj, data, parent);
    return obj;
  }

  toData(target: PObject, obj: any, oldObj?: any): any {
    if (!(obj instanceof this.objClass)) {
      throw new Error('invalid object type');
    }
    return PersistentData.extract(obj);
  }
}

export class ObjectAccessors extends PrimitiveAccessors {
  mapper: ObjectMapper;

  constructor(...rest) {
    super(...rest);
    let Type = this.parameters[0];
    this.mapper = new ObjectMapper(Type);
  }

  get(target: PObject): any {
    if (!Reflect.hasMetadata(Metadata.EMBEDDED, target, this.propertyKey)) {
      let data = super.get(target);
      if (!data) {
        data = Object.create(null);
        super.setInternal(target, data);
      }
      let obj = this.mapper.fromData(target, data);
      Reflect.defineMetadata(Metadata.EMBEDDED, obj, target, this.propertyKey);
    }
    return Reflect.getMetadata(Metadata.EMBEDDED, target, this.propertyKey);
  }

  set(target: PObject, obj: any): boolean {
    let data = this.mapper.toData(target, obj);
    super.set(target, data);
    Reflect.defineMetadata(Metadata.EMBEDDED, obj, target, this.propertyKey);
    return true;
  }
}
