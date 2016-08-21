import {persistify} from '../persistify';
import {Util} from '../util';

const collectables = new WeakSet();

export function isCollectable(entity) {
  let Target = Util.getClass(entity);
  return collectables.has(Target);
}

export function Collectable(optTarget) {
  let isDecorator = Util.isClassDecorator(...arguments);
  let deco = function(Target) {
    collectables.add(Target);
    return persistify(Target);
  };
  return isDecorator ? deco(optTarget) : deco;
}
