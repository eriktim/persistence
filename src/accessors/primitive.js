import {PersistentConfig} from '../persistent-config';
import {PersistentData} from '../persistent-data';
import {Util} from '../util';

export class PrimitiveAccessors {
  config: PersistentConfig;
  fullPath: string;
  parameters: any[];
  propertyKey: PropertyKey;

  constructor(config: PersistentConfig, propertyKey: PropertyKey, parameters: any[]) {
    let propConfig = config.getProperty(propertyKey);
    this.fullPath = propConfig.fullPath;
    this.config = config;
    this.parameters = parameters;
    this.propertyKey = propertyKey;
  }

  get(target: PObject): any {
    return PersistentData.getProperty(target, this.fullPath);
  }

  set(target: PObject, value: any): boolean {
    return this.setInternal(target, value, true);
  }

  setInternal(target: PObject, value: any, triggerHooks: boolean = false): boolean {
    let oldValue = PersistentData.getProperty(target, this.fullPath);
    let update = oldValue !== value;
    if (update) {
      triggerHooks && Util.applySafe(this.config.preUpdate, target);
      PersistentData.setProperty(target, this.fullPath, value);
      triggerHooks && Util.applySafe(this.config.postUpdate, target);
    }
    return update;
  }
}
