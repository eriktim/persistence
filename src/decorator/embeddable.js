import {PersistentObject} from '../persistent-object';
import {Util} from '../util';

export function Embeddable(optTarget) {
  let isDecorator = Util.isClassDecorator(...arguments);
  let deco = function(Target) {
    Target.isEmbeddable = true;
    if (!Target.isPersistent) {
      return PersistentObject.byDecoration(Target);
    }
  };
  return isDecorator ? deco(optTarget) : deco;
}
