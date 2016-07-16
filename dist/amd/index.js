define(['exports', './entity-manager', './decorator/element-collection', './decorator/embeddable', './decorator/embedded', './decorator/entity', './decorator/id', './decorator/many-to-one', './decorator/one-to-many', './decorator/one-to-one', './decorator/post-load', './decorator/post-persist', './decorator/post-remove', './decorator/pre-load', './decorator/pre-persist', './decorator/pre-remove', './decorator/property', './decorator/temporal', './decorator/transient'], function (exports, _entityManager, _elementCollection, _embeddable, _embedded, _entity, _id, _manyToOne, _oneToMany, _oneToOne, _postLoad, _postPersist, _postRemove, _preLoad, _prePersist, _preRemove, _property, _temporal, _transient) {
  'use strict';

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, 'EntityManager', {
    enumerable: true,
    get: function () {
      return _entityManager.EntityManager;
    }
  });
  Object.defineProperty(exports, 'ElementCollection', {
    enumerable: true,
    get: function () {
      return _elementCollection.ElementCollection;
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
  Object.defineProperty(exports, 'OneToMany', {
    enumerable: true,
    get: function () {
      return _oneToMany.OneToMany;
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
  Object.defineProperty(exports, 'PreLoad', {
    enumerable: true,
    get: function () {
      return _preLoad.PreLoad;
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
  Object.defineProperty(exports, 'TemporalType', {
    enumerable: true,
    get: function () {
      return _temporal.TemporalType;
    }
  });
  Object.defineProperty(exports, 'Transient', {
    enumerable: true,
    get: function () {
      return _transient.Transient;
    }
  });
});