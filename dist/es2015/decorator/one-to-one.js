import { PersistentConfig } from '../persistent-config';
import { getUri, idFromUri } from '../entity-manager';
import { ENTITY_MANAGER } from '../symbols';
import { Util } from '../util';

const referencesMap = new WeakMap();
const SELF_REF = 'self';

function getAndSetReferenceFactory(Type, getter, setter) {
  return [function (target, propertyKey) {
    if (Type === SELF_REF) {
      Type = Object.getPrototypeOf(target).constructor;
    }
    if (!referencesMap.has(target)) {
      referencesMap.set(target, new Map());
    }
    const references = referencesMap.get(target);
    const entityManager = target[ENTITY_MANAGER];
    return Promise.resolve().then(() => {
      if (!references.has(propertyKey)) {
        let uri = Reflect.apply(getter, target, []);
        let id = idFromUri(uri);
        if (id) {
          return entityManager.find(Type, id).then(entity => references.set(propertyKey, entity));
        }
      }
    }).then(() => references.get(propertyKey)).then(entity => {
      if (entity && !entityManager.contains(target) && entityManager.contains(entity)) {
        entityManager.detach(entity);
      }
      return entity;
    });
  }, function (target, propertyKey, entity) {
    if (Type === SELF_REF) {
      Type = Object.getPrototypeOf(target).constructor;
    }
    if (!(entity instanceof Type)) {
      throw new TypeError('invalid reference object');
    }
    let uri = getUri(entity);
    if (!uri) {
      throw new TypeError('bad reference object');
    }
    Reflect.apply(setter, target, [uri]);
    if (!referencesMap.has(target)) {
      referencesMap.set(target, new Map());
    }
    const references = referencesMap.get(target);
    references.set(propertyKey, entity);
  }];
}

export function OneToOne(Type, options = {}) {
  if (Util.isPropertyDecorator(...arguments) || Util.is(Type) && Type !== SELF_REF && !Util.isClass(Type)) {
    throw new Error('@OneToOne requires a constructor argument');
  }
  return function (target, propertyKey) {
    let config = PersistentConfig.get(target).getProperty(propertyKey);
    let [getReference, setReference] = getAndSetReferenceFactory(Type, config.getter, config.setter);
    config.configure({
      getter: function () {
        return getReference(this, propertyKey);
      },
      setter: function (val) {
        setReference(this, propertyKey, val);
      }
    });
  };
}