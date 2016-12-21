import {PersistentConfig} from '../persistent-config';
import {PersistentObject} from '../persistent-object';

export function Entity(optionsOrTarget: string|IEntityOptions): ClassDecorator {
  return function(Target: PClass) {
    let options = typeof optionsOrTarget === 'string' ?
        {path: optionsOrTarget} : optionsOrTarget || {};
    // FIXME warn Function.name
    let path = options.path || Target.name.toLowerCase();
    let nonPersistent = options.nonPersistent || false;
    const config = PersistentConfig.get(Target);
    config.configure({
      path,
      cacheOnly: false,
      nonPersistent
    });
    return PersistentObject.byDecoration(Target);
  };
}
