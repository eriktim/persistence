import { PersistentObject } from '../persistent-object';
import { Util } from '../util';

const collectibles = new WeakSet();

export function isCollectible(entity) {
  let Target = Util.getClass(entity);
  return collectibles.has(Target);
}

export function Collectible(optTarget) {
  let isDecorator = Util.isClassDecorator(...arguments);
  let deco = function (Target) {
    collectibles.add(Target);
    return PersistentObject.byDecoration(Target);
  };
  return isDecorator ? deco(optTarget) : deco;
}