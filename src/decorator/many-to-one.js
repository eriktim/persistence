import {PersistentConfig} from '../persistent-config';
import {ReferencesFactory} from '../references';
import {Util} from '../util';

const referencesMap = new WeakMap();
const SELF_REF = 'self';

function getReferencesFactory(Type, getter, setter) {
  return function(target, propertyKey) {
    if (!referencesMap.has(target)) {
      referencesMap.set(target, new Map());
    }
    const references = referencesMap.get(target);
    let p = Promise.resolve();
    if (!references.has(propertyKey)) {
      let data = Reflect.apply(getter, target, []);
      if (data === undefined) {
        data = [];
        Reflect.apply(setter, target, [data]);
      }
      if (!Array.isArray(data)) {
        throw new Error('references data is corrupt');
      }
      p = ReferencesFactory.request(Type, data, target).then(setOfReferences => {
        references.set(propertyKey, setOfReferences);
      });
    }
    return p.then(() => references.get(propertyKey));
  };
}

export function ManyToOne(Type, options = {}) {
  if (Util.isPropertyDecorator(...arguments) ||
    (Util.is(Type) && Type !== SELF_REF && !Util.isClass(Type))) {
    throw new Error('@ManyToOne requires a constructor argument');
  }
  return function(target, propertyKey) {
    let config = PersistentConfig.get(target).getProperty(propertyKey);
    let getReferences = getReferencesFactory(
      Type, config.getter, config.setter);
    config.configure({
      getter: function() {
        return getReferences(this, propertyKey);
      },
      setter: function(val) {
        throw new Error('cannot override set of references');
      }
    });
  };
}
