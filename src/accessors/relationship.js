import {Metadata} from '../metadata';
import {getEntity} from '../persistent-object';
import {getUri, idFromUri, awaitUri} from '../entity-manager';

import {PrimitiveAccessors} from './primitive';

export class RelationshipAccessors extends PrimitiveAccessors {
  static converterFactory(Type: any) {
    return {
      dataToObject: async function(data: any, parent: any) {
        const entity = getEntity(parent);
        const entityManager = Reflect.getMetadata(Metadata.ENTITY_MANAGER, entity);
        const config = entityManager.config;
        let uri = config.unwrapUri(data);
        let id = idFromUri(uri);
        return id ? await entityManager.find(Type, id) : undefined;
      },
      objectToData: function(obj: any) {
        if (!(obj instanceof Type)) {
          throw new TypeError('invalid relationship object');
        }
        let uri = getUri(obj);
        let promise = uri ? Promise.resolve(uri) : awaitUri(obj);
        return promise.then(uri => {
          const entityManager = Reflect.getMetadata(Metadata.ENTITY_MANAGER, obj);
          const config = entityManager.config;
          return config.wrapUri(uri);
        });
      }
    };
  }

  converter;

  constructor(...rest) {
    super(...rest);
    let Type = this.parameters[0];
    this.converter = RelationshipAccessors.converterFactory(Type);
  }

  async get(target: PObject): any {
    const relationship = Reflect.getMetadata(Metadata.ONE_TO_ONE, target, this.propertyKey);
    const entity = getEntity(target);
    const entityManager = Reflect.getMetadata(Metadata.ENTITY_MANAGER, entity);
    if (!relationship) {
      const relationships = Reflect.getMetadata(Metadata.ENTITY_RELATIONSHIPS, entity);
      let data = super.get(target);
      let value = await this.converter.dataToObject(data, target);
      Reflect.defineMetadata(Metadata.ONE_TO_ONE, value, target, this.propertyKey);
      relationships.add(value);
    }
    let value = Reflect.getMetadata(Metadata.ONE_TO_ONE, target, this.propertyKey);
    if (value && !entityManager.contains(target) && entityManager.contains(value)) {
      entityManager.detach(value);
    }
    return value;
  }

  set(target: PObject, value: any) {
    const relationship = Reflect.getMetadata(Metadata.ONE_TO_ONE, target, this.propertyKey);
    const entity = getEntity(target);
    const relationships = Reflect.getMetadata(Metadata.ENTITY_RELATIONSHIPS, entity);
    if (relationship) {
      relationships.delete(relationship);
      setUnresolvedRelation(entity, relationship, null); // TODO FIXME
    }
    this.converter.objectToData(value).then(data => {
      // don't wait for me
      super.set(target, data);
    });
    Reflect.defineMetadata(Metadata.ONE_TO_ONE, value, target, this.propertyKey);
    relationships.add(value);
    return true;
  }
}
