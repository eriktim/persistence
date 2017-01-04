import {PersistentData} from '../persistent-data';

const PROP_LENGTH = 'length';

// TODO Type or Relationship!!! FIXME

export function arrayHandlerFactory(toData: (obj: any) => any): ProxyHandler {
  return {
    get: function(target, property) {
      return target[property];
    },
    set: function(target, property, value) {
      if (property === PROP_LENGTH) {
        let data = PersistentData.extract(target);
        data[PROP_LENGTH] = value;
      } else {
        let index = parseInt(property, 10);
        if (property === String(index)) {
          let data = PersistentData.extract(target);
          data[index] = toData(value);
        }
      }
      target[property] = value;
      return true;
    }
  };
};
