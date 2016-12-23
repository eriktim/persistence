import {PropertyAccessors} from './property';

export class IdAccessors extends PropertyAccessors {
  set(target: PObject, value: any) {
    throw new Error('cannot set server-generated id');
  }
}
