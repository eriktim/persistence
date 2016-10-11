import { PersistentObject } from '../persistent-object';
import { Util } from '../util';

export function Collectible(optTarget) {
  let isDecorator = Util.isClassDecorator(...arguments);
  let deco = function (Target) {
    Target.isCollectible = true;
    return PersistentObject.byDecoration(Target);
  };
  return isDecorator ? deco(optTarget) : deco;
}