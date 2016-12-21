import {EntityManager} from '../entity-manager';

export const entityHandler: ProxyHandler = {
  construct: function(Target: PClass, argumentsList: any[]) {
    return Reflect.construct(function(entityManager) {
      if (!(entityManager instanceof EntityManager)) {
        throw new Error('Use EntityManager#create to create new entities');
      }
      // defineSymbol(this, ENTITY_MANAGER,
      //   {value: entityManager, writable: false});
      // defineSymbol(this, RELATIONS, {value: new Set(), writable: false});
      // defineSymbol(this, REMOVED, false);
    }, argumentsList, Target);
  }
};
