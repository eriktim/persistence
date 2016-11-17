define(['exports', './decorator/collectible', './decorator/collection', './decorator/embeddable', './decorator/embedded', './decorator/entity', './decorator/id', './decorator/many-to-one', './decorator/one-to-one', './decorator/post-load', './decorator/post-persist', './decorator/post-remove', './decorator/pre-persist', './decorator/pre-remove', './decorator/property', './decorator/temporal', './decorator/transient', './config', './entity-manager'], function (exports, _collectible, _collection, _embeddable, _embedded, _entity, _id, _manyToOne, _oneToOne, _postLoad, _postPersist, _postRemove, _prePersist, _preRemove, _property, _temporal, _transient, _config, _entityManager) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'Collectible', {
    enumerable: true,
    get: function () {
      return _collectible.Collectible;
    }
  });
  Object.defineProperty(exports, 'Collection', {
    enumerable: true,
    get: function () {
      return _collection.Collection;
    }
  });
  Object.defineProperty(exports, 'Embeddable', {
    enumerable: true,
    get: function () {
      return _embeddable.Embeddable;
    }
  });
  Object.defineProperty(exports, 'Embedded', {
    enumerable: true,
    get: function () {
      return _embedded.Embedded;
    }
  });
  Object.defineProperty(exports, 'Entity', {
    enumerable: true,
    get: function () {
      return _entity.Entity;
    }
  });
  Object.defineProperty(exports, 'Id', {
    enumerable: true,
    get: function () {
      return _id.Id;
    }
  });
  Object.defineProperty(exports, 'ManyToOne', {
    enumerable: true,
    get: function () {
      return _manyToOne.ManyToOne;
    }
  });
  Object.defineProperty(exports, 'OneToOne', {
    enumerable: true,
    get: function () {
      return _oneToOne.OneToOne;
    }
  });
  Object.defineProperty(exports, 'PostLoad', {
    enumerable: true,
    get: function () {
      return _postLoad.PostLoad;
    }
  });
  Object.defineProperty(exports, 'PostPersist', {
    enumerable: true,
    get: function () {
      return _postPersist.PostPersist;
    }
  });
  Object.defineProperty(exports, 'PostRemove', {
    enumerable: true,
    get: function () {
      return _postRemove.PostRemove;
    }
  });
  Object.defineProperty(exports, 'PrePersist', {
    enumerable: true,
    get: function () {
      return _prePersist.PrePersist;
    }
  });
  Object.defineProperty(exports, 'PreRemove', {
    enumerable: true,
    get: function () {
      return _preRemove.PreRemove;
    }
  });
  Object.defineProperty(exports, 'Property', {
    enumerable: true,
    get: function () {
      return _property.Property;
    }
  });
  Object.defineProperty(exports, 'Temporal', {
    enumerable: true,
    get: function () {
      return _temporal.Temporal;
    }
  });
  Object.defineProperty(exports, 'TemporalFormat', {
    enumerable: true,
    get: function () {
      return _temporal.TemporalFormat;
    }
  });
  Object.defineProperty(exports, 'Transient', {
    enumerable: true,
    get: function () {
      return _transient.Transient;
    }
  });
  Object.defineProperty(exports, 'Config', {
    enumerable: true,
    get: function () {
      return _config.Config;
    }
  });
  Object.defineProperty(exports, 'EntityManager', {
    enumerable: true,
    get: function () {
      return _entityManager.EntityManager;
    }
  });
});