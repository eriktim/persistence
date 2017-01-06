import {PersistentConfig} from '../persistent-config';
import {PersistentData} from '../persistent-data';
import {Util} from '../util';

const updateHookTriggers = new WeakSet();

export class PrimitiveAccessors {
  config: PersistentConfig;
  fullPath: string;
  mapper: IMapper;
  propertyKey: PropertyKey;

  constructor(config: PersistentConfig, propertyKey: PropertyKey, mapper?: IMapper) {
    let propConfig = config.getProperty(propertyKey);
    this.fullPath = propConfig.fullPath;
    this.config = config;
    this.mapper = mapper || null;
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
      let runningUpdateHooks = updateHookTriggers.has(target);
      if (runningUpdateHooks) {
        triggerHooks = false;
      } else {
        updateHookTriggers.add(target);
      }
      if (triggerHooks) {
        Util.applySafe(this.config.preUpdate, target);
      }
      PersistentData.setProperty(target, this.fullPath, value);
      if (triggerHooks) {
        Util.applySafe(this.config.postUpdate, target);
      }
      if (!runningUpdateHooks) {
        updateHookTriggers.delete(target);
      }
    }
    return update;
  }
}
