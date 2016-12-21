import {PersistentObject} from '../persistent-object';

export function Embeddable(): ClassDecorator {
  return function(Target: PClass) {
    Target.isEmbeddable = true;
    return PersistentObject.byDecoration(Target, true);
  };
}
