import {Metadata} from '../metadata';
import {PersistentData} from '../persistent-data';
import {PersistentObject} from '../persistent-object';
import {getEntity} from '../persistent-object';
import {getUri, idFromUri, awaitUri} from '../entity-manager';

import {PrimitiveAccessors} from './primitive';

export class ObjectMapper implements IMapper {
  objClass: any;

  constructor(objClass: any) {
    this.objClass = objClass;
  }

  fromData(target: PObject, data: any): Promise<any> {
    let obj = new this.objClass();
    PersistentObject.apply(obj, data, parent);
    return obj;
  }

  toData(target: PObject, obj: any): any {
    if (!(obj instanceof this.objClass)) {
      throw new Error('invalid object type');
    }
    return PersistentData.extract(obj);
  }
}

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
  abortPendingSet: Function;

  constructor(...rest) {
    super(...rest);
    let Type = this.parameters[0];
    this.mapper = new RelationshipMapper(Type);
  }

  async get(target: PObject): any {
    let value = Reflect.getMetadata(Metadata.ONE_TO_ONE, target, this.propertyKey);
    if (!value) {
      let data = super.get(target);
      value = await this.mapper.fromData(target, data);
      Reflect.defineMetadata(Metadata.ONE_TO_ONE, value, target, this.propertyKey);
    }
    return value;
  }

  set(target: PObject, value: any): boolean {
    const oldValue = Reflect.getMetadata(Metadata.ONE_TO_ONE, target, this.propertyKey);
    if (oldValue) {
      this.unlink(target, oldValue);
    }
    if (this.abortPendingSet) {
      this.abortPendingSet();
    }
    let abort = new Promise(resolve => {
      this.abortPendingSet = () => resolve(false);
    });
    Promise.race([this.mapper.toData(target, value), abort]).then(data => {
      if (data) {
        super.set(target, data);
      }
      this.abortPendingSet = null;
    });
    Reflect.defineMetadata(Metadata.ONE_TO_ONE, value, target, this.propertyKey);
    return true;
  }
}
