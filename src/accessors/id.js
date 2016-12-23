import {getProperty} from './property';

export function getId(target: PObject, propertyKey: PropertyKey): any {
  return getProperty(target, config, propertyKey);
}

export async function setId(target: PObject, propertyKey: PropertyKey, value: any): boolean {
  throw new Error('cannot set server-generated id');
}
