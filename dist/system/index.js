'use strict';

System.register(['./entity-manager', './decorator/element-collection', './decorator/embeddable', './decorator/embedded', './decorator/entity', './decorator/id', './decorator/many-to-one', './decorator/one-to-many', './decorator/one-to-one', './decorator/post-load', './decorator/post-persist', './decorator/post-remove', './decorator/pre-load', './decorator/pre-persist', './decorator/pre-remove', './decorator/property', './decorator/temporal', './decorator/transient'], function (_export, _context) {
  return {
    setters: [function (_entityManager) {
      var _exportObj = {};
      _exportObj.EntityManager = _entityManager.EntityManager;

      _export(_exportObj);
    }, function (_decoratorElementCollection) {
      var _exportObj2 = {};
      _exportObj2.ElementCollection = _decoratorElementCollection.ElementCollection;

      _export(_exportObj2);
    }, function (_decoratorEmbeddable) {
      var _exportObj3 = {};
      _exportObj3.Embeddable = _decoratorEmbeddable.Embeddable;

      _export(_exportObj3);
    }, function (_decoratorEmbedded) {
      var _exportObj4 = {};
      _exportObj4.Embedded = _decoratorEmbedded.Embedded;

      _export(_exportObj4);
    }, function (_decoratorEntity) {
      var _exportObj5 = {};
      _exportObj5.Entity = _decoratorEntity.Entity;

      _export(_exportObj5);
    }, function (_decoratorId) {
      var _exportObj6 = {};
      _exportObj6.Id = _decoratorId.Id;

      _export(_exportObj6);
    }, function (_decoratorManyToOne) {
      var _exportObj7 = {};
      _exportObj7.ManyToOne = _decoratorManyToOne.ManyToOne;

      _export(_exportObj7);
    }, function (_decoratorOneToMany) {
      var _exportObj8 = {};
      _exportObj8.OneToMany = _decoratorOneToMany.OneToMany;

      _export(_exportObj8);
    }, function (_decoratorOneToOne) {
      var _exportObj9 = {};
      _exportObj9.OneToOne = _decoratorOneToOne.OneToOne;

      _export(_exportObj9);
    }, function (_decoratorPostLoad) {
      var _exportObj10 = {};
      _exportObj10.PostLoad = _decoratorPostLoad.PostLoad;

      _export(_exportObj10);
    }, function (_decoratorPostPersist) {
      var _exportObj11 = {};
      _exportObj11.PostPersist = _decoratorPostPersist.PostPersist;

      _export(_exportObj11);
    }, function (_decoratorPostRemove) {
      var _exportObj12 = {};
      _exportObj12.PostRemove = _decoratorPostRemove.PostRemove;

      _export(_exportObj12);
    }, function (_decoratorPreLoad) {
      var _exportObj13 = {};
      _exportObj13.PreLoad = _decoratorPreLoad.PreLoad;

      _export(_exportObj13);
    }, function (_decoratorPrePersist) {
      var _exportObj14 = {};
      _exportObj14.PrePersist = _decoratorPrePersist.PrePersist;

      _export(_exportObj14);
    }, function (_decoratorPreRemove) {
      var _exportObj15 = {};
      _exportObj15.PreRemove = _decoratorPreRemove.PreRemove;

      _export(_exportObj15);
    }, function (_decoratorProperty) {
      var _exportObj16 = {};
      _exportObj16.Property = _decoratorProperty.Property;

      _export(_exportObj16);
    }, function (_decoratorTemporal) {
      var _exportObj17 = {};
      _exportObj17.Temporal = _decoratorTemporal.Temporal;
      _exportObj17.TemporalType = _decoratorTemporal.TemporalType;

      _export(_exportObj17);
    }, function (_decoratorTransient) {
      var _exportObj18 = {};
      _exportObj18.Transient = _decoratorTransient.Transient;

      _export(_exportObj18);
    }],
    execute: function () {}
  };
});