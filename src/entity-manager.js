import {Config} from './config';
import {Metadata} from './metadata';
import {PersistentConfig} from './persistent-config';
import {PersistentData} from './persistent-data';
import {PersistentObject} from './persistent-object';
import {Util} from './util';

const serverMap = new WeakMap();
const contextMap = new WeakMap();
const cacheMap = new WeakMap();
const pendingUriMap = new WeakMap();

export function getServerForTesting(entityManager) {
  return serverMap.get(entityManager);
}

export function getUri(entity) {
  let path = getPath(entity);
  let id = getId(entity);
  return path && id ? `${path}/${id}` : undefined;
}

export function idFromUri(uri) {
  return uri ? uri.split('?')[0].split('/').pop() : undefined;
}

export async function awaitUri(entity) {
  if (!Reflect.hasMetadata(Metadata.PENDING_RELATIONSHIP, entity)) {
    let r;
    let p = new Promise(resolve => {
      r = resolve;
    });
    pendingUriMap.set(entity, r);
    Reflect.defineMetadata(Metadata.PENDING_RELATIONSHIP, p, entity);
  }
  return Reflect.getMetadata(Metadata.PENDING_RELATIONSHIP, entity);
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

  async create(Target, data = null) {
    let config = PersistentConfig.get(Target);
    if (!config || !config.path) {
      throw new Error('EntityManager expects a valid Entity');
    }
    if (data === null) {
      data = Object.create(null);
    }
    if (!Util.isObject(data)) {
      return null;
    }
    let entity = new Target(this);
    await PersistentObject.apply(entity, data);
    config.nonPersistent || attach(this, entity);
    await Util.applySafe(config.postLoad, entity);
    return entity;
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
        let noCache = () => {
          let config = PersistentConfig.get(Entity);
          if (config.cacheOnly) {
            return Promise.resolve(null);
          }
          return serverMap.get(this).get(uri)
            .then(data => this.create(Entity, data))
            .then(entity => cachedEntity(entity, cache, uri));
        };
        return cache.get(uri) || noCache();
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
          .then(batchesOrMap => {
            let batches = batchesOrMap instanceof Map ?
                [batchesOrMap] : Array.from(batchesOrMap);
            batches.forEach(map => {
              if (!(map instanceof Map)) {
                throw new Error(
                  'entityMapper must return a (collection of) Map(s)');
              }
            });
            return batches.reduce((promise, map) => {
              let entries = Array.from(map);
              return promise.then(entities => {
                return Promise.all(entries.map(entry => {
                  return this.create(entry[1], entry[0])
                    .then(entity => {
                      if (!hasId(entity)) {
                        return entity;
                      }
                      let uri = getUri(entity);
                      return cache.get(uri) || cachedEntity(entity, cache, uri);
                    });
                }))
                .then(newEntities => entities.concat(newEntities));
              });
            }, Promise.resolve([]));
          });
      });
  }

  persist(entity) {
    return Promise.resolve()
      .then(() => {
        assertEntity(this, entity);
      })
      .then(() => {
        // persist related entities
        let relationships = Reflect.getMetadata(Metadata.ENTITY_RELATIONSHIPS, entity);
        return Promise.all(Array.from(relationships)
            .map(relationship => this.persist(relationship)))
            .then(() => {
              relationships.forEach(relationship => {
                if (pendingUriMap.has(relationship)) {
                  let resolve = pendingUriMap.get(relationship);
                  resolve(getUri(relationship));
                  pendingUriMap.delete(relationship);
                }
              });
            })
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
            .then(() => Util.applySafe(config.prePersist, entity))
            .then(() => Reflect.apply(fetch, server,
                [noId ? path : `${path}/${id}`, data]))
            .then(raw => {
              if (noId) {
                let location = Reflect.getMetadata(Metadata.REST_LOCATION, raw);
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
                let cache = cacheMap.get(this);
                let uri = getUri(entity);
                cachedEntity(entity, cache, uri);
              }
            })
            .then(() => attach(this, entity))
            .then(() => Util.applySafe(config.postPersist, entity));
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
          .then(() => Util.applySafe(config.preRemove, entity))
          .then(() => id ?
              serverMap.get(this).delete(`${path}/${id}`) : undefined)
          .then(() => Reflect.defineMetadata(Metadata.ENTITY_IS_REMOVED, true, entity))
          .then(() => Util.applySafe(config.postRemove, entity))
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
                Reflect.defineMetadata(Metadata.REST_LOCATION, location, obj);
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
