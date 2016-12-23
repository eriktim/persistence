import {PersistentConfig} from '../persistent-config';
import {PersistentData} from '../persistent-data';

export function getProperty(target: PObject, propertyKey: PropertyKey): any {
  let config = PersistentConfig.get(target.constructor);
  let propConfig = config.getProperty(propertyKey);
  return PersistentData.getProperty(target, propConfig.fullPath);
}

export async function setProperty(target: PObject, propertyKey: PropertyKey, value: any): boolean {
  let config = PersistentConfig.get(target.constructor);
  let propConfig = config.getProperty(propertyKey);
  let oldValue = PersistentData.getProperty(target, propConfig.fullPath);
  if (oldValue !== value) {
    if (await runUpdateHook(config.preUpdate, value, oldValue)) {
      PersistentData.setProperty(target, propConfig.fullPath, value);
      await runUpdateHook(config.postUpdate, value, oldValue);
    }
  }
}

async function runUpdateHook(fn: Function, propertyKey: PropertyKey, newValue: any, oldValue: any): boolean {
  let result = true;
  if (fn) {
    result = await !!Reflect.apply(fn, this, [propertyKey, newValue, oldValue]);
  }
  return result;
}
