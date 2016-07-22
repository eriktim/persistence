import {Util} from '../util';

const embeddables = new WeakSet();

export function isEmbeddable(entity) {
  let Target = Util.getClass(entity);
  return embeddables.has(Target);
}

export function Embeddable(optTarget) {
  let isDecorator = Util.isClassDecorator(...arguments);
  let deco = function(Target) {
    embeddables.add(Target);
  };
  return isDecorator ? deco(optTarget) : deco;
}
