'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CachedEntity = CachedEntity;

var _persistentConfig = require('../persistent-config');

var _util = require('../util');

function CachedEntity(pathOrTarget) {
  var isDecorator = _util.Util.isClassDecorator.apply(_util.Util, arguments);
  var deco = function deco(Target) {
    var defaultPath = function defaultPath() {
      return Target.name.toLowerCase();
    };
    var path = isDecorator ? defaultPath() : pathOrTarget || defaultPath();
    var config = _persistentConfig.PersistentConfig.get(Target);
    config.configure({
      path: path,
      cacheOnly: true,
      nonPersistent: true
    });
  };
  return isDecorator ? deco(pathOrTarget) : deco;
}