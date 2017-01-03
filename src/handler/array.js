import {PersistentData} from '../persistent-data';

const PROP_LENGTH = 'length';

export function arrayHandlerFactory(Type: any): ProxyHandler {
  return {
    get: function(target, property) {
      return target[property];
    },
    set: function(target, property, value) {
      if (property === PROP_LENGTH) {
        let data = PersistentData.extract(target);
        data[property] = value;
      } else {
        let index = parseInt(property, 10);
        if (property === String(index)) {
          if (!(value instanceof Type)) {
            throw new Error('invalid object type');
          }
          let data = PersistentData.extract(target);
          data[index] = PersistentData.extract(value);
        }
      }
      target[property] = value;
      return true;
    }
  };
};
