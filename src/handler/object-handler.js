import {PersistentConfig, PropertyType} from '../persistent-config';
import {PersistentData} from '../persistent-data';

export const objectHandler = {
  get: function(target, property, receiver) {
    const config = PersistentConfig.get(target.constructor);
    const propConfig = config.getProperty(property);
    if (propConfig) {
      return PersistentData.getProperty(receiver, propConfig.fullPath);
    } else {
      return target[property];
    }
  },
  set: async function(target, property, value, receiver) {
    // TODO if !destroyed! && REUSE
    const config = PersistentConfig.get(target.constructor);
    const propConfig = config.getProperty(property);
    if (propConfig) {
      if (propConfig.type === PropertyType.ID) {
        throw new Error('cannot set server-generated id');
      }
      // REUSE pre/postUpdate TODO
      let oldValue = PersistentData.getProperty(receiver, propConfig.fullPath);
      if (oldValue !== value) {
        let preUpdate = config.preUpdate;
        if (preUpdate) {
          let result = await Reflect.apply(preUpdate, this, [property, value, oldValue]);
          if (result !== true) {
            return true;
          }
        }
        PersistentData.setProperty(receiver, propConfig.fullPath, value);
        target[property] = value; // for debugging
        let postUpdate = config.postUpdate;
        if (postUpdate) {
          await Reflect.apply(postUpdate, this, [property, value, oldValue]);
        }
      }
    } else {
      target[property] = value;
    }
    return true;
  }
};
