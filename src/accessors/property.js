import {PersistentConfig} from '../persistent-config';
import {PersistentData} from '../persistent-data';
import {Util} from '../util';

export class PropertyAccessors {
  config: PersistentConfig;
  fullPath: string;
  postUpdate: Function;
  preUpdate: Function;
  propertyKey: PropertyKey;

  constructor(config: PersistentConfig, propertyKey: PropertyKey) {
    let propConfig = config.getProperty(propertyKey);
    this.fullPath = propConfig.fullPath;
    this.config = config;
    this.propertyKey = propertyKey;
  }

  get(target: PObject): any {
    return PersistentData.getProperty(target, this.fullPath);
  }

  async set(target: PObject, value: any): boolean {
    let oldValue = PersistentData.getProperty(target, this.fullPath);
    let update = oldValue !== value;
    if (update) {
      await Util.applySafe(this.config.preUpdate, target);
      PersistentData.setProperty(target, this.fullPath, value);
      await Util.applySafe(this.config.postUpdate, target);
    }
    return update;
  }
}
