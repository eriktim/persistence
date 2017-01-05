import {Metadata} from '../metadata';
import {getEntity} from '../persistent-object';
import {getUri, idFromUri, awaitUri} from '../entity-manager';

import {PrimitiveAccessors} from './primitive';

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
    return id ? entityManager.find(this.objClass, id) : Promise.resolve(undefined);
  }

  toData(target: PObject, obj: any): Promise<any> {
    if (!(obj instanceof this.objClass)) {
      throw new TypeError('invalid relationship object');
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

export class RelationshipAccessors extends PrimitiveAccessors {
  mapper: RelationshipMapper;
  pendingSet: Promise<any>;

  constructor(...rest) {
    super(...rest);
    let Type = this.parameters[0];
    this.mapper = new RelationshipMapper(Type);
  }

  async get(target: PObject): any {
    let value = Reflect.getMetadata(Metadata.ONE_TO_ONE, target, this.propertyKey);
    const entity = getEntity(target);
    const entityManager = Reflect.getMetadata(Metadata.ENTITY_MANAGER, entity);
    if (!value) {
      const relationships = Reflect.getMetadata(Metadata.ENTITY_RELATIONSHIPS, entity);
      let data = super.get(target);
      value = await this.mapper.fromData(target, data);
      Reflect.defineMetadata(Metadata.ONE_TO_ONE, value, target, this.propertyKey);
      relationships.add(value);
    }
    if (value && !entityManager.contains(target) && entityManager.contains(value)) {
      entityManager.detach(value);
    }
    return value;
  }

  set(target: PObject, value: any) {
    const oldValue = Reflect.getMetadata(Metadata.ONE_TO_ONE, target, this.propertyKey);
    if (oldValue) {
      this.unlink(target, oldValue);
    }
    this.pendingSet = this.mapper.toData(target, value);
    this.pendingSet.then(data => {
      // don't wait for me
      this.pendingSet = null;
      super.set(target, data);
    }, () => {});
    Reflect.defineMetadata(Metadata.ONE_TO_ONE, value, target, this.propertyKey);
    return true;
  }
}
