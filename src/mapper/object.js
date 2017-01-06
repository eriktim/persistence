import {PersistentData} from '../persistent-data';
import {PersistentObject} from '../persistent-object';

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

  toData(target: PObject, obj: any): any {
    if (!(obj instanceof this.objClass)) {
      throw new Error('invalid object type');
    }
    return PersistentData.extract(obj);
  }
}
