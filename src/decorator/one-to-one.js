import {PersistentConfig} from '../persistent-config';
import {getUri, idFromUri, setUnresolvedRelation} from '../entity-manager';
import {getEntity} from '../persistent-object';
import {ENTITY_MANAGER, RELATIONS} from '../symbols';
import {Util} from '../util';

const referencesMap = new WeakMap();
const SELF_REF = 'self';

function getRelationMap(obj) {
  let entity = getEntity(obj);
  return entity ? entity[RELATIONS] : undefined;
}

function getAndSetReferenceFactory(Type, getter, setter) {
  return [
    function(target, propertyKey) {
      if (Type === SELF_REF) {
        Type = Object.getPrototypeOf(target).constructor;
      }
      if (!referencesMap.has(target)) {
        referencesMap.set(target, new Map());
      }
      const references = referencesMap.get(target);
      const entityManager = target[ENTITY_MANAGER];
      const config = entityManager.config;
      return Promise.resolve()
        .then(() => {
          if (!references.has(propertyKey)) {
            let reference = Reflect.apply(getter, target, []);
            let uri = config.referenceToUri(reference);
            let id = idFromUri(uri);
            if (id) {
              return entityManager.find(Type, id).then(entity => {
                references.set(propertyKey, entity);
                getRelationMap(target).add(entity);
              });
            }
          }
        })
        .then(() => references.get(propertyKey))
        .then(entity => {
          if (entity && !entityManager.contains(target) &&
              entityManager.contains(entity)) {
            entityManager.detach(entity);
          }
          return entity;
        });
    },
    function(target, propertyKey, relatedEntity) {
      if (Type === SELF_REF) {
        Type = Object.getPrototypeOf(target).constructor;
      }
      if (!(relatedEntity instanceof Type)) {
        throw new TypeError('invalid reference object');
      }
      let entity = getEntity(target);
      const entityManager = target[ENTITY_MANAGER];
      const config = entityManager.config;
      if (!referencesMap.has(target)) {
        referencesMap.set(target, new Map());
      }
      const references = referencesMap.get(target);
      if (references.has(propertyKey)) {
        let oldRelatedEntity = references.get(propertyKey);
        getRelationMap(target).delete(oldRelatedEntity);
        setUnresolvedRelation(entity, oldRelatedEntity, null);
      }
      getRelationMap(target).add(relatedEntity);
      let setUri = uri => {
        let reference = config.uriToReference(uri);
        Reflect.apply(setter, target, [reference]);
      };
      let uri = getUri(relatedEntity);
      if (uri) {
        setUri(uri);
      } else {
        setUnresolvedRelation(entity, relatedEntity, setUri);
      }
      references.set(propertyKey, relatedEntity);
    }
  ];
}

export function OneToOne(Type: PClass): PropertyDecorator {
  if (Util.is(Type) && Type !== SELF_REF && !Type.isPersistent) {
    throw new Error('@OneToOne requires a constructor argument');
  }
  return function(target: PObject, propertyKey: PropertyKey) {
    let config = PersistentConfig.get(target).getProperty(propertyKey);
    let [getReference, setReference] = getAndSetReferenceFactory(
        Type, config.getter, config.setter);
    config.configure({
      getter: function() {
        return getReference(this, propertyKey);
      },
      setter: function(val) {
        setReference(this, propertyKey, val);
      }
    });
  };
}
