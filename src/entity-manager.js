import {Config} from './config';
import {PersistentConfig} from './persistent-config';
import {PersistentData} from './persistent-data';
import {PersistentObject} from './persistent-object';
import {RELATIONS, REMOVED} from './symbols';
import {Util} from './util';

const LOCATION = Symbol('location');

const serverMap = new WeakMap();
const contextMap = new WeakMap();
const cacheMap = new WeakMap();
const unresolvedRelationsMap = new WeakMap();

export function getLocationSymbolForTesting() {
  return LOCATION;
}

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

export function setUnresolvedRelation(entity, relatedEntity, setUri) {
  if (!unresolvedRelationsMap.has(entity)) {
    unresolvedRelationsMap.set(entity, new Map());
  }
  let unresolvedEntityRelationsMap = unresolvedRelationsMap.get(entity);
  if (setUri) {
    unresolvedEntityRelationsMap.set(relatedEntity, setUri);
  } else {
    unresolvedEntityRelationsMap.delete(relatedEntity);
  }
}

function applySafe(fn, thisObj, args = []) {
  return fn ? Reflect.apply(fn, thisObj, args) : undefined;
}

function assertEntity(entityManager, entity) {
  if (!entityManager.contains(entity)) {
    throw new TypeError('argument is not a persistent entity');
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

  create(Target, data = {}) {
    return Promise.resolve()
      .then(() => {
        let config = PersistentConfig.get(Target);
        if (!config || !config.path) {
          throw new Error('EntityManager expects a valid Entity');
        }
        if (!Util.isObject(data)) {
          return null;
        }
        let entity = new Target(this);
        return Promise.resolve()
          .then(() => PersistentObject.apply(entity, data))
          .then(() => config.nonPersistent || attach(this, entity))
          .then(() => applySafe(config.postLoad, entity))
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

  query(Entity, stringOrPropertyMap = {}) {
    return Promise.resolve()
      .then(() => {
        let entityMapper = this.config.queryEntityMapperFactory(Entity);
        let path = getPath(Entity);
        let cache = cacheMap.get(this);
        return serverMap.get(this).get(path, stringOrPropertyMap)
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
        // persist related entities
        return Promise.all(Array.from(entity[RELATIONS])
            .map(e => this.persist(e)));
      })
      .then(() => {
        if (unresolvedRelationsMap.has(entity)) {
          // set uri of unresolved related entities
          let entries = unresolvedRelationsMap.get(entity).entries();
          for (let [relation, setUri] of entries) {
            let uri = getUri(relation);
            setUri(uri);
          }
          unresolvedRelationsMap.delete(entity);
        }
      })
      .then(() => {
        let id = getId(entity);
        let noId = !id;
        if (noId || PersistentData.isDirty(entity)) {
          let server = serverMap.get(this);
          let fetch = noId ? server.post : server.put;
          let path = getPath(entity);
          let config = PersistentConfig.get(entity);
          let data = PersistentData.extract(entity);
          return Promise.resolve()
            .then(() => applySafe(config.prePersist, entity))
            .then(() => Reflect.apply(fetch, server,
                [noId ? path : `${path}/${id}`, data]))
            .then(raw => {
              if (noId) {
                let location = raw[LOCATION];
                if (!location) {
                  throw new Error('REST server should return'
                      + ' the location of the new entity');
                }
                let idPath = location.substring(
                    location.lastIndexOf(path) + path.length + 1);
                // remove additional slashes
                let index = idPath.indexOf('/');
                let newId = index > 0 ? idPath.substring(0, index) : idPath;
                PersistentData.setProperty(entity, config.idKey, newId);
                PersistentData.setNotDirty(entity);
              }
            })
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

  get(path, stringOrPropertyMap = {}) {
    return this.fetch(path, {
      method: 'GET'
    }, stringOrPropertyMap);
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

  fetch(uri, init, stringOrPropertyMap = {}) {
    let params = typeof stringOrPropertyMap === 'string' ?
        '?' + stringOrPropertyMap : toParams(stringOrPropertyMap);
    let url = this.baseUrl + '/' + uri + params;
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
              let location = response.headers.get('location');
              let promise = response.json();
              return location ? promise.then(obj => {
                obj[LOCATION] = location;
                return obj;
              }) : promise;
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
