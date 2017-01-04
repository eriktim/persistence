import {Metadata} from '../metadata';
import {getEntity} from '../persistent-object';
import {getUri, idFromUri, setUnresolvedRelation} from '../entity-manager';

import {PrimitiveAccessors} from './primitive';

export class RelationshipArrayAccessors extends PrimitiveAccessors {
  async get(target: PObject): any {
    const relationship = Reflect.getMetadata(Metadata.ONE_TO_ONE, target, this.propertyKey);
    const entity = getEntity(target);
    const entityManager = Reflect.getMetadata(Metadata.ENTITY_MANAGER, entity);
    if (!relationship) {
      const relationships = Reflect.getMetadata(Metadata.ENTITY_RELATIONSHIPS, entity);
      const config = entityManager.config;
      let wrappedUri = super.get(target);
      let uri = config.unwrapUri(wrappedUri);
      let id = idFromUri(uri);
      if (id) {
        let Type = this.parameters[0];
        let value = await entityManager.find(Type, id);
        Reflect.defineMetadata(Metadata.ONE_TO_ONE, value, target, this.propertyKey);
        relationships.add(value);
      }
    }
    let value = Reflect.getMetadata(Metadata.ONE_TO_ONE, target, this.propertyKey);
    if (value && !entityManager.contains(target) && entityManager.contains(value)) {
      entityManager.detach(value);
    }
    return value;
  }

  set(target: PObject, value: any) {
    let Type = this.parameters[0];
    if (!(value instanceof Type)) {
      throw new TypeError('invalid reference object');
    }
    const relationship = Reflect.getMetadata(Metadata.ONE_TO_ONE, target, this.propertyKey);
    const entity = getEntity(target);
    const entityManager = Reflect.getMetadata(Metadata.ENTITY_MANAGER, entity);
    const relationships = Reflect.getMetadata(Metadata.ENTITY_RELATIONSHIPS, entity);
    const config = entityManager.config;
    if (relationship) {
      relationships.delete(relationship);
      setUnresolvedRelation(entity, relationship, null);
    }
    let setUri = uri => {
      let wrappedUri = config.wrapUri(uri);
      super.set(target, wrappedUri);
    };
    let uri = getUri(value);
    if (uri) {
      setUri(uri);
    } else {
      setUnresolvedRelation(entity, value, setUri);
    }
    Reflect.defineMetadata(Metadata.ONE_TO_ONE, value, target, this.propertyKey);
    relationships.add(value);
    return true;
  }
}
