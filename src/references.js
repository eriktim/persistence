import {getUri, idFromUri, setUnresolvedRelation} from './entity-manager';
import {getEntity} from './persistent-object';
import {ENTITY_MANAGER, RELATIONS, VERSION} from './symbols';

const configMap = new WeakMap();
const referenceMap = new WeakMap();
const promiseMap = new WeakMap();

function getRelationMap(obj) {
  let entity = getEntity(obj);
  return entity ? entity[RELATIONS] : undefined;
}

export function loadReferencesData(references, array) {
  let config = configMap.get(references);
  config.silent = true;
  if (config.array) {
    if (config.array === array) {
      return;
    }
    references.clear();
  }
  config.array = array;
  const entityManager = config.target[ENTITY_MANAGER];
  let promises = array.splice(0, array.length).map(data => {
    let uri = entityManager.config.referenceToUri(data);
    let id = idFromUri(uri);
    if (id) {
      return entityManager.find(config.Type, id).then(entity => {
        references.add(entity);
        return entity;
      });
    }
  });
  let p = Promise.all(promises).then(entities => {
    config.silent = false;
    if (!entityManager.contains(config.target)) {
      entities.forEach(entity => {
        if (entity && entityManager.contains(entity)) {
          entityManager.detach(entity);
        }
      });
    }
  });
  promiseMap.set(references, p);
  return p;
}

function versionUp(target) {
  if (target) {
    target[VERSION]++;
  }
}

class References extends Set {
  add(item) {
    if (this.has(item)) {
      return this;
    }
    let config = configMap.get(this);
    if (!(item instanceof config.Type)) {
      throw new TypeError('invalid reference object');
    }
    super.add(item);
    let entityManager = config.target[ENTITY_MANAGER];
    let setUri = uri => {
      let reference = entityManager.config.uriToReference(uri);
      referenceMap.set(item, reference);
      config.array.push(reference);
    };
    let uri = getUri(item);
    if (uri) {
      setUri(uri);
    } else {
      setUnresolvedRelation(config.target, item, setUri);
    }
    getRelationMap(config.target).add(item);
    if (!config.silent) {
      versionUp(config.target);
    }
    return this;
  }

  clear() {
    let config = configMap.get(this);
    config.array.splice(0, config.array.length);
    for (let item of this) {
      getRelationMap(config.target).delete(item);
      setUnresolvedRelation(config.target, item, null);
    }
    super.clear();
    if (!config.silent) {
      versionUp(config.target);
    }
  }

  delete(item) {
    let config = configMap.get(this);
    let data = referenceMap.get(item);
    let index = config.array.indexOf(data);
    if (index) {
      config.array.splice(index, 1);
    }
    getRelationMap(config.target).delete(item);
    setUnresolvedRelation(config.target, item, null);
    let deleted = super.delete(item);
    if (!config.silent) {
      versionUp(config.target);
    }
    return deleted;
  }

  // similar to Promise.all(...)
  then(fn) {
    return promiseMap.get(this).then(() => fn(Array.from(this)));
  }
}

export class ReferencesFactory {
  static create(Type, array, target) {
    let references = new References();
    configMap.set(references, {
      Type,
      silent: false,
      target
    });
    loadReferencesData(references, array);
    return references;
  }
}
