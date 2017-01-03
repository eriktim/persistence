import {PersistentConfig} from '../persistent-config';
import {PersistentObject} from '../persistent-object';

export function Entity(path?: string): ClassDecorator {
  return function(Target: PClass) {
    if (!path) {
      // FIXME warn Function.name
      path = Target.name.toLowerCase();
    }
    const config = PersistentConfig.get(Target);
    config.configure({path});
    return PersistentObject.byDecoration(Target, true);
  };
}

export function LocalEntity(path?: string): ClassDecorator {
  return function(Target: PClass) {
    if (!path) {
      // FIXME warn Function.name
      path = Target.name.toLowerCase();
    }
    const config = PersistentConfig.get(Target);
    config.configure({
      path,
      cacheOnly: true,
      nonPersistent: true
    });
  };
}
