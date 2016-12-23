import {PrimitiveAccessors} from './primitive';

export class RelationshipAccessors extends PrimitiveAccessors {
  async get(target: PObject): any {
    // if (Type === SELF_REF) {
    //   Type = Object.getPrototypeOf(target).constructor;
    // }
    // if (!referencesMap.has(target)) {
    //   referencesMap.set(target, new Map());
    // }
    // const references = referencesMap.get(target);
    // const entityManager = target[ENTITY_MANAGER];
    // const config = entityManager.config;
    // return Promise.resolve()
    //   .then(() => {
    //     if (!references.has(propertyKey)) {
    //       let wrappedUri = super.get(target);
    //       let uri = config.unwrapUri(wrappedUri);
    //       let id = idFromUri(uri);
    //       if (id) {
    //         return entityManager.find(Type, id).then(entity => {
    //           references.set(propertyKey, entity);
    //           getRelationMap(target).add(entity);
    //         });
    //       }
    //     }
    //   })
    //   .then(() => references.get(propertyKey))
    //   .then(entity => {
    //     if (entity && !entityManager.contains(target) &&
    //       entityManager.contains(entity)) {
    //       entityManager.detach(entity);
    //     }
    //     return entity;
    //   });
  }

  set(target: PObject, value: any) {
  //   if (Type === SELF_REF) {
  //     Type = Object.getPrototypeOf(target).constructor;
  //   }
  //   if (!(relatedEntity instanceof Type)) {
  //     throw new TypeError('invalid reference object');
  //   }
  //   let entity = getEntity(target);
  //   const entityManager = target[ENTITY_MANAGER];
  //   const config = entityManager.config;
  //   if (!referencesMap.has(target)) {
  //     referencesMap.set(target, new Map());
  //   }
  //   const references = referencesMap.get(target);
  //   if (references.has(propertyKey)) {
  //     let oldRelatedEntity = references.get(propertyKey);
  //     getRelationMap(target).delete(oldRelatedEntity);
  //     setUnresolvedRelation(entity, oldRelatedEntity, null);
  //   }
  //   getRelationMap(target).add(relatedEntity);
  //   let setUri = uri => {
  //     let wrappedUri = config.wrapUri(uri);
  //     super.set(target, wrappedUri);
  //   };
  //   let uri = getUri(relatedEntity);
  //   if (uri) {
  //     setUri(uri);
  //   } else {
  //     setUnresolvedRelation(entity, relatedEntity, setUri);
  //   }
  //   references.set(propertyKey, relatedEntity);
  }
}
