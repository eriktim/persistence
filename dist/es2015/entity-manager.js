import { Config } from './config';
import { EntityConfig } from './entity-config';
import { EntityData } from './entity-data';
import { Util } from './util';

const servers = new WeakMap();

export function getServerForTesting(resourceManager) {
  return servers.get(resourceManager);
}

function getId(entity) {
  return entity[EntityConfig.get(entity).idKey];
}

function getPath(entityOrEntity) {
  let Entity = Util.getClass(entityOrEntity);
  let path = EntityConfig.get(Entity).path;
  if (!path) {
    throw new Error('object is not a valid entity');
  }
  return path;
}

function waitForCall(fn, thisObj) {
  return Promise.resolve(fn ? Reflect.apply(fn, thisObj, []) : undefined);
}

function toParams(...maps) {
  let flatMap = maps.map(map => {
    if (!Util.is(map)) {
      return {};
    }
    if (!Util.isObject(map)) {
      throw new TypeError(`argument should be an 'object'`);
    }
    return map;
  }).reduce((flat, map) => Object.assign(flat, map), {});

  return Object.keys(flatMap).map(key => `${ encodeURIComponent(key) }=${ encodeURIComponent(flatMap[key]) }`).join('&');
}

export let EntityManager = class EntityManager {

  constructor(config = null) {
    config = config || Config.getDefault();
    if (!(config instanceof Config)) {
      throw new Error('EntityManagerFactory requires a Config');
    }
    this.config = config.current;
    servers.set(this, new Server(this.config));
  }

  create(Target, data) {
    return Promise.resolve().then(() => {
      if (!EntityConfig.has(Target)) {
        throw new Error('EntityFactory expects a valid Entity');
      }
      if (!Util.isObject(data)) {
        return null;
      }
      let config = EntityConfig.get(Target);
      let entity = new Target(this);
      return Promise.resolve().then(() => waitForCall(config.preLoad, entity)).then(() => EntityData.inject(entity, data)).then(() => waitForCall(config.postLoad, entity)).then(() => entity);
    });
  }

  findById(Entity, id) {
    return Promise.resolve().then(() => {
      if (typeof id !== 'string' && typeof id !== 'number') {
        throw new TypeError(`id must be a 'string' or 'number', not '${ typeof id }'`);
      }
      let path = getPath(Entity);
      return servers.get(this).get(`${ path }/${ id }`).then(data => this.create(Entity, data));
    });
  }

  find(Entity, propertyMap = {}) {
    return Promise.resolve().then(() => {
      let path = getPath(Entity);
      return servers.get(this).get(path, propertyMap).then(array => Promise.all(array ? array.map(data => this.create(Entity, data)) : []));
    });
  }

  save(entity) {
    return Promise.resolve().then(() => {
      let id = getId(entity);
      let fetch = id ? servers.get(this).put : servers.get(this).post;
      let path = getPath(entity);
      let config = EntityConfig.get(entity);
      let data = EntityData.extract(entity);
      return Promise.resolve().then(() => waitForCall(config.prePersist, entity)).then(() => Reflect.apply(fetch, servers.get(this), [id ? `${ path }/${ id }` : path, data])).then(raw => raw && EntityData.inject(entity, raw)).then(() => waitForCall(config.postPersist, entity)).then(() => entity);
    });
  }

  setInterceptor(requestInterceptor) {
    servers.get(this).requestInterceptor = requestInterceptor;
  }

  reload(entity) {
    return Promise.resolve().then(() => {
      let Entity = Util.getClass(entity);
      let idKey = EntityConfig.get(Entity).idKey;
      let id = entity[idKey];
      EntityData.inject(entity, {});
      return this.findById(Entity, id);
    });
  }

  remove(entity) {
    return Promise.resolve().then(() => {
      let id = getId(entity);
      let path = getPath(entity);
      let config = EntityConfig.get(entity);
      return Promise.resolve().then(() => waitForCall(config.preRemove, entity)).then(() => id ? servers.get(this).delete(`${ path }/${ id }`) : undefined).then(() => config.configure({ removed: true })).then(() => waitForCall(config.postRemove, entity)).then(() => entity);
    });
  }
};

let Server = class Server {

  constructor(config) {
    this.baseUrl = (config.baseUrl || '').replace(/\/$/, '');
  }

  delete(path) {
    return this.fetch(path, {
      method: 'DELETE'
    });
  }

  get(path, propertyMap = {}) {
    return this.fetch(path, {
      method: 'GET'
    }, propertyMap);
  }

  post(path, data) {
    return this.fetch(path, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  put(path, data) {
    return this.fetch(path, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  fetch(path, init, propertyMap = {}) {
    let url = `${ this.baseUrl }/${ path }`;
    let params = toParams(propertyMap);
    init.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let request = new Request(`${ url }?${ params }`, init);
    return Promise.resolve().then(() => {
      if (typeof this.requestInterceptor === 'function') {
        return this.requestInterceptor(request);
      }
    }).then(requestOrResponse => {
      return requestOrResponse instanceof Response ? requestOrResponse : fetch(requestOrResponse || request);
    }).then(response => {
      if (response.ok) {
        let contentType = response.headers.get('content-type');
        if (contentType && contentType.startsWith('application/json')) {
          return response.json();
        }
      }
      return null;
    }).catch(err => {
      console.error(err.message);
      return null;
    });
  }
};