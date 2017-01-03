import {EntityManager} from '../entity-manager';
import {Metadata} from '../metadata';
import {PersistentObject} from '../persistent-object';

import {objectHandler} from './object';

export const constructionHandlerFactory: () => ProxyHandler = function(isEntity: boolean) {
  let handler;
  if (isEntity) {
    handler = {
      construct: function(Target: PClass, argumentsList: any[]) {
        let obj = Reflect.construct(function(entityManager) {
          // empty constructor function
        }, argumentsList, Target);
        let proxy = new Proxy(obj, objectHandler);
        let [entityManager] = argumentsList;
        if (!(entityManager instanceof EntityManager)) {
          throw new Error('Use EntityManager#create to create new entities');
        }
        Reflect.defineMetadata(Metadata.ENTITY_MANAGER, entityManager, proxy);
        Reflect.defineMetadata(Metadata.ENTITY_RELATIONSHIPS, new Set(), proxy);
        Reflect.defineMetadata(Metadata.ENTITY_IS_REMOVED, false, proxy);
        return proxy;
      }
    };
  } else {
    handler = {
      construct: function(Target: PClass, argumentsList: any[]) {
        let obj = Reflect.construct(function() {
          // empty constructor function
        }, argumentsList, Target);
        let proxy = new Proxy(obj, objectHandler);
        let data = argumentsList.length === 1 ?
            argumentsList[0] : Object.create(null);
        PersistentObject.apply(proxy, data, null);
        return proxy;
      }
    }
  }
  return handler;
};
