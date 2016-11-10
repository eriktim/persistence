import {PersistentObject} from '../persistent-object';
import {Util} from '../util';

export function Embeddable(optTarget) {
  let isDecorator = Util.isClassDecorator(...arguments);
  let deco = function(Target) {
    Target.isEmbeddable = true;
    return PersistentObject.byDecoration(Target, true);
  };
  return isDecorator ? deco(optTarget) : deco;
}
