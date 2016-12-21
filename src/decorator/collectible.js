import {PersistentObject} from '../persistent-object';

export function Collectible(): ClassDecorator {
  return function(Target: PClass) {
    Target.isCollectible = true;
    return PersistentObject.byDecoration(Target, true);
  };
}
