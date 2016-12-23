import {EntityManager} from '../entity-manager';
import {Metadata} from '../metadata';

import {objectHandler} from './object-handler';

export const constructionHandler: ProxyHandler = {
  construct: function(Target: PClass, argumentsList: any[]) {
    let obj = Reflect.construct(function(entityManager) {
      if (!(entityManager instanceof EntityManager)) {
        throw new Error('Use EntityManager#create to create new entities');
      }
      Reflect.defineMetadata(Metadata.ENTITY_MANAGER, entityManager, this);
      Reflect.defineMetadata(Metadata.ENTITY_RELATIONS, new Set(), this);
      Reflect.defineMetadata(Metadata.ENTITY_IS_REMOVED, false, this);
    }, argumentsList, Target);
    return new Proxy(obj, objectHandler);
  }
};
