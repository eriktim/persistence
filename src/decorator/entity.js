import {PersistentConfig} from '../persistent-config';
import {PersistentObject} from '../persistent-object';

function decoratorFactory(path?: string, obj: any) {
  return function(Target: PClass) {
    if (!path) {
      // FIXME warn Function.name
      path = Target.name.toLowerCase();
    }
    obj['path'] = path;
    const config = PersistentConfig.get(Target);
    config.configure(obj);
    return PersistentObject.byDecoration(Target, true);
  };
}

export function Entity(path?: string): ClassDecorator {
  return decoratorFactory(path, {});
}

export function PhonyEntity(path?: string): ClassDecorator {
  return decoratorFactory(path, {
    cacheOnly: true,
    nonPersistent: true
  });
}
