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
          if (!(entityManager instanceof EntityManager)) {
            throw new Error('Use EntityManager#create to create new entities');
          }
          Reflect.defineMetadata(Metadata.ENTITY_MANAGER, entityManager, this);
          Reflect.defineMetadata(Metadata.ENTITY_RELATIONSHIPS, new Set(), this);
          Reflect.defineMetadata(Metadata.ENTITY_IS_REMOVED, false, this);
        }, argumentsList, Target);
        return new Proxy(obj, objectHandler);
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
