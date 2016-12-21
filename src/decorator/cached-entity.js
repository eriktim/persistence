import {PersistentConfig} from '../persistent-config';

export function CachedEntity(path?: string): ClassDecorator {
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
