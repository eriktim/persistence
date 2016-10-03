import {Config} from './config';
import {PersistentConfig} from './persistent-config';
import {PersistentData} from './persistent-data';
import {PersistentObject} from './persistent-object';
import {ENTITY_MANAGER, REMOVED, defineSymbol} from './symbols';
import {Util} from './util';

const serverMap = new WeakMap();
const contextMap = new WeakMap();
const cacheMap = new WeakMap();

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

function applySafe(fn, thisObj, args = []) {
  return fn ? Reflect.apply(fn, thisObj, args) : undefined;
}

function assertEntity(entityManager, entity) {
  if (!entityManager.contains(entity)) {
    throw new TypeError('argument is not a valid entity');
  }
}

function attach(entityManager, entity) {
  contextMap.get(entityManager).add(entity);
}

function cachedEntity(entity, cache, uri) {
  cache.set(uri, entity);
  return entity;
}

function getId(entity) {
  const config = PersistentConfig.get(entity);
  let idKey = config.idKey;
  if (!idKey) {
    throw new Error('Entity has no primary key');
  }
  return entity[idKey];
}

function hasId(entity) {
  const config = PersistentConfig.get(entity);
  return !!config.idKey;
}

function getPath(entityOrEntity) {
  let Entity = Util.getClass(entityOrEntity);
  let path = PersistentConfig.get(Entity).path;
  if (!path) {
    throw new Error('object is not a valid Entity');
  }
  return path;
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

  let params = Object.keys(flatMap).map(key =>
      encodeURIComponent(key) + '=' + encodeURIComponent(flatMap[key]))
      .join('&');
  return params.length ? '?' + params : '';
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
    cacheMap.set(this, new Map());
  }

  contains(entity) {
    return contextMap.get(this).has(entity);
  }

  create(Target, data) {
    return Promise.resolve()
      .then(() => {
        let config = PersistentConfig.get(Target);
        if (!config || !config.path) {
          throw new Error('EntityManager expects a valid Entity');
        }
        if (!Util.isObject(data)) {
          return null;
        }
        let entity = new Target();
        defineSymbol(entity, REMOVED, false);
        defineSymbol(entity, ENTITY_MANAGER, {value: this, writable: false});
        return Promise.resolve()
          .then(() => PersistentObject.apply(entity, data))
          .then(() => applySafe(config.postLoad, entity))
          .then(() => attach(this, entity))
          .then(() => entity);
      });
  }

  detach(entity) {
    cacheMap.get(this).delete(getUri(entity));
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
        let uri = `${path}/${id}`;
        let cache = cacheMap.get(this);
        return cache.get(uri) ||
            serverMap.get(this).get(uri)
              .then(data => this.create(Entity, data))
              .then(entity => cachedEntity(entity, cache, uri));
      });
  }

  query(Entity, propertyMap = {}) {
    return Promise.resolve()
      .then(() => {
        let entityMapper = this.config.queryEntityMapperFactory(Entity);
        let path = getPath(Entity);
        let cache = cacheMap.get(this);
        return serverMap.get(this).get(path, propertyMap)
          .then(entityMapper)
          .then(map => {
            if (!(map instanceof Map)) {
              throw new Error('entityMapper must return a Map');
            }
            let entries = Array.from(map.entries());
            return Promise.all(entries.map(entry =>
                this.create(entry[1], entry[0])));
          })
          .then(entities => entities.map(entity => {
            if (!hasId(entity)) {
              return entity;
            }
            let uri = getUri(entity);
            return cache.get(uri) || cachedEntity(entity, cache, uri);
          }));
      });
  }

  persist(entity) {
    return Promise.resolve()
      .then(() => {
        assertEntity(this, entity);
        let id = getId(entity);
        if (!id || PersistentData.isDirty(entity)) {
          let fetch = id ? serverMap.get(this).put : serverMap.get(this).post;
          let path = getPath(entity);
          let config = PersistentConfig.get(entity);
          let data = PersistentData.extract(entity);
          return Promise.resolve()
            .then(() => applySafe(config.prePersist, entity))
            .then(() => Reflect.apply(fetch, serverMap.get(this),
                [id ? `${path}/${id}` : path, data]))
            .then(raw => raw && PersistentObject.setData(entity, raw))
            .then(() => attach(this, entity))
            .then(() => applySafe(config.postPersist, entity));
        }
      })
      .then(() => entity);
  }

  refresh(entity, reload = false /* TODO */) {
    return Promise.resolve()
      .then(() => {
        assertEntity(this, entity);
        let id = getId(entity);
        return this.find(Util.getClass(entity), id)
          .then(newEntity => {
            let data = PersistentData.extract(newEntity);
            PersistentObject.setData(entity, data);
            return entity;
          });
      });
  }

  remove(entity) {
    return Promise.resolve()
      .then(() => {
        assertEntity(this, entity);
        let id = getId(entity);
        let path = getPath(entity);
        let config = PersistentConfig.get(entity);
        return Promise.resolve()
          .then(() => applySafe(config.preRemove, entity))
          .then(() => id ?
              serverMap.get(this).delete(`${path}/${id}`) : undefined)
          .then(() => entity[REMOVED] = true)
          .then(() => applySafe(config.postRemove, entity))
          .then(() => this.detach(entity))
          .then(() => entity);
      });
  }
}

class Server {
  baseUrl;
  fetchInterceptor;

  constructor(config) {
    this.baseUrl = (config.baseUrl || '').replace(/\/$/, '');
    this.fetchInterceptor = config.fetchInterceptor;
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

  fetch(uri, init, propertyMap = {}) {
    let url = this.baseUrl + '/' + uri + toParams(propertyMap);
    init.headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
    return Promise.resolve()
      .then(() => {
        if (typeof this.fetchInterceptor === 'function') {
          return this.fetchInterceptor(url, init);
        }
        return new Request(url, init);
      })
      .then(requestResponseOrData => {
        return requestResponseOrData instanceof Request ?
            fetch(requestResponseOrData) : requestResponseOrData;
      })
      .then(responseOrData => {
        if (responseOrData instanceof Response) {
          let response = responseOrData;
          if (response.ok) {
            let contentType = response.headers.get('content-type');
            if (contentType && contentType.startsWith('application/json')) {
              return response.json();
            }
          }
          return null;
        }
        return responseOrData;
      })
      .catch(() => {
        return null;
      });
  }
}
