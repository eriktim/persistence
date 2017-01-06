import {Metadata} from '../metadata';
import {PersistentObject} from '../persistent-object';
import {getEntity} from '../persistent-object';
import {getUri, idFromUri, awaitUri} from '../entity-manager';

export class RelationshipMapper implements IMapper {
  objClass: any;

  constructor(objClass: any) {
    this.objClass = objClass;
  }

  fromData(target: PObject, data: any): Promise<any> {
    const entity = getEntity(target);
    const entityManager = Reflect.getMetadata(Metadata.ENTITY_MANAGER, entity);
    const config = entityManager.config;
    let uri = config.unwrapUri(data);
    let id = idFromUri(uri);
    if (!id) {
      return Promise.resolve(undefined);
    }
    return entityManager.find(this.objClass, id).then(obj => {
      const relationships = Reflect.getMetadata(Metadata.ENTITY_RELATIONSHIPS, entity);
      relationships.add(obj);
      if (obj && !entityManager.contains(target) && entityManager.contains(obj)) {
        entityManager.detach(obj);
      }
      return obj;
    });
  }

  toData(target: PObject, obj: any): Promise<any> {
    if (!(obj instanceof this.objClass)) {
      throw new TypeError('invalid related entity');
    }
    const entity = getEntity(target);
    const relationships = Reflect.getMetadata(Metadata.ENTITY_RELATIONSHIPS, entity);
    relationships.add(obj);
    let uri = getUri(obj);
    let promise = uri ? Promise.resolve(uri) : awaitUri(obj);
    return promise.then(uri => {
      const entityManager = Reflect.getMetadata(Metadata.ENTITY_MANAGER, obj);
      const config = entityManager.config;
      return config.wrapUri(uri);
    });
  }

  unlink(target: PObject, obj: any) {
    const entity = getEntity(target);
    const relationships = Reflect.getMetadata(Metadata.ENTITY_RELATIONSHIPS, entity);
    relationships.delete(obj);
  }
}
