import {PrimitiveAccessors} from './primitive';

export class IdAccessors extends PrimitiveAccessors {
  set(target: PObject, value: any) {
    throw new Error('cannot set server-generated id');
  }
}
