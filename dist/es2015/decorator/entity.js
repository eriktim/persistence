import { PersistentConfig } from '../persistent-config';
import { PersistentObject } from '../persistent-object';
import { Util } from '../util';

export function Entity(optionsOrTarget) {
  const isDecorator = Util.isClassDecorator(...arguments);
  const deco = function (Target) {
    const defaultPath = () => Target.name.toLowerCase();
    let path;
    let nonPersistent = false;
    if (isDecorator) {
      path = defaultPath();
    } else {
      let options = typeof optionsOrTarget === 'string' ? { path: optionsOrTarget } : optionsOrTarget || {};
      path = options.path || defaultPath();
      nonPersistent = options.nonPersistent || false;
    }
    const config = PersistentConfig.get(Target);
    config.configure({
      path,
      cacheOnly: false,
      nonPersistent
    });
    return PersistentObject.byDecoration(Target);
  };
  return isDecorator ? deco(optionsOrTarget) : deco;
}