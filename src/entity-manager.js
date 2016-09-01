import {Config} from './config';
import {EntityConfig} from './entity-config';
import {PersistentData} from './persistent-data';
import {REMOVED} from './symbols';
import {Util} from './util';

const serverMap = new WeakMap();
const contextMap = new WeakMap();

export function getServerForTesting(entityManager) {
  return serverMap.get(entityManager);
}

export function getUri(entity) {
  let parts = [getPath(entity), getId(entity)].filter(v => v);
  return parts.length === 2 ? parts.join('/') : undefined;
}

export function idFromUri(uri) {
  return uri ? uri.split('?')[0].split('/').pop() : undefined;
}

function applyAsPromise(fn, thisObj, args = []) {
  return Promise.resolve(fn ? Reflect.apply(fn, thisObj, args) : undefined);
}

function attach(entityManager, entity) {
  contextMap.get(entityManager).add(entity);
}

function getId(entity) {
  const config = EntityConfig.get(entity);
  let idKey = config.idKey;
  if (!idKey) {
    throw new Error('Entity has no primary key');
  }
  return entity[idKey];
}

function getPath(entityOrEntity) {
  let Entity = Util.getClass(entityOrEntity);
  let path = EntityConfig.get(Entity).path;
  if (!path) {
    throw new Error('object is not a valid Entity');
  }
  return path;
}

function assertEntity(entityManager, entity) {
  if (!entityManager.contains(entity)) {
    throw new TypeError('argument is not a valid entity');
  }
}

function toParams(...maps) {
  let flatMap = maps
    .map(map => {
      if (!Util.is(map)) {
        return {};
      }
      if (!Util.isObject(map)) {
        throw new TypeError(`argument should be an 'object'`);
      }
      return map;
    })
    .reduce((flat, map) => Object.assign(flat, map), {});

  return Object.keys(flatMap).map(key =>
      encodeURIComponent(key) + '=' + encodeURIComponent(flatMap[key]))
      .join('&');
}

export class EntityManager {
  config;

  constructor(config = null) {
    config = config || Config.getDefault();
    if (!(config instanceof Config)) {
      throw new Error('EntityManager requires a Config');
    }
    this.config = config.current;
    serverMap.set(this, new Server(this.config));
    this.clear();
  }

  clear() {
    contextMap.set(this, new WeakSet());
  }

  contains(entity) {
    return contextMap.get(this).has(entity);
  }

  create(Target, data) {
    return Promise.resolve()
      .then(() => {
        let config = EntityConfig.get(Target);
        if (!config || !config.path) {
          throw new Error('EntityManager expects a valid Entity');
        }
        if (!Util.isObject(data)) {
          return null;
        }
        let entity = new Target(this);
        return Promise.resolve()
          .then(() => PersistentData.inject(entity, data))
          .then(() => applyAsPromise(config.postLoad, entity))
          .then(() => attach(this, entity))
          .then(() => entity);
      });
  }

  detach(entity) {
    return contextMap.get(this).delete(entity);
  }

  find(Entity, id) {
    return Promise.resolve()
      .then(() => {
        if (typeof id !== 'string' && typeof id !== 'number') {
          throw new TypeError(
              `id must be a 'string' or 'number', not '${typeof id}'`);
        }
        let path = getPath(Entity);
        return serverMap.get(this).get(`${path}/${id}`)
          .then(data => this.create(Entity, data));
      });
  }

  query(Entity, propertyMap = {}) {
    return Promise.resolve()
      .then(() => {
        let path = getPath(Entity);
        return serverMap.get(this).get(path, propertyMap)
          .then(values => Promise.all(values ? values.map(
              data => this.create(Entity, data)) : []));
      });
  }

  persist(entity) {
    return Promise.resolve()
      .then(() => {
        assertEntity(this, entity);
        let id = getId(entity);
        let fetch = id ? serverMap.get(this).put : serverMap.get(this).post;
        let path = getPath(entity);
        let config = EntityConfig.get(entity);
        let data = PersistentData.extract(entity);
        return Promise.resolve()
          .then(() => applyAsPromise(config.prePersist, entity))
          .then(() => Reflect.apply(fetch, serverMap.get(this),
              [id ? `${path}/${id}` : path, data]))
          .then(raw => raw && PersistentData.inject(entity, raw))
          .then(() => attach(this, entity))
          .then(() => applyAsPromise(config.postPersist, entity))
          .then(() => entity);
      });
  }

  setInterceptor(requestInterceptor) {
    serverMap.get(this).requestInterceptor = requestInterceptor;
  }

  refresh(entity, reload = false /* TODO */) {
    return Promise.resolve()
      .then(() => {
        assertEntity(this, entity);
        let id = getId(entity);
        PersistentData.inject(entity, {});
        return this.find(Util.getClass(entity), id);
      });
  }

  remove(entity) {
    return Promise.resolve()
      .then(() => {
        assertEntity(this, entity);
        let id = getId(entity);
        let path = getPath(entity);
        let config = EntityConfig.get(entity);
        return Promise.resolve()
          .then(() => applyAsPromise(config.preRemove, entity))
          .then(() => id ?
              serverMap.get(this).delete(`${path}/${id}`) : undefined)
          .then(() => entity[REMOVED] = true)
          .then(() => applyAsPromise(config.postRemove, entity))
          .then(() => this.detach(entity))
          .then(() => entity);
      });
  }
}

class Server {
  baseUrl;
  requestInterceptor;

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
    let url = `${this.baseUrl}/${path}`;
    let params = toParams(propertyMap);
    init.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    let request = new Request(`${url}?${params}`, init);
    return Promise.resolve()
      .then(() => {
        if (typeof this.requestInterceptor === 'function') {
          return this.requestInterceptor(request);
        }
      })
      .then(requestOrResponse => {
        return requestOrResponse instanceof Response ?
            requestOrResponse : fetch(requestOrResponse || request);
      })
      .then(response => {
        if (response.ok) {
          let contentType = response.headers.get('content-type');
          if (contentType && contentType.startsWith('application/json')) {
            return response.json();
          }
        }
        return null;
      })
      .catch(() => {
        return null;
      });
  }
}
