import {PersistentData} from '../persistent-data';

const PROP_LENGTH = 'length';

export function arrayHandlerFactory(mapper: IMapper): ProxyHandler {
  return {
    get: function(target, property) {
      return target[property];
    },
    set: function(target, property, value) {
      if (property === PROP_LENGTH) {
        if (mapper.unlink) {
          mapper.unlink(target, target[property]);
        }
        let arr = PersistentData.extract(target);
        arr[PROP_LENGTH] = value;
      } else {
        let index = parseInt(property, 10);
        if (property === String(index)) {
          let arr = PersistentData.extract(target);
          let data = mapper.toData(target, value);
          if (data instanceof Promise) {
            data.then(d => arr[index] = d); // deferred
          } else {
            arr[index] = data;
          }
        }
      }
      target[property] = value;
      return true;
    }
  };
};
