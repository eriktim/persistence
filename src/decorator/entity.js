import {PersistentConfig} from '../persistent-config';
import {PersistentObject} from '../persistent-object';
import {Util} from '../util';

export function Entity(optionsOrTarget) {
  const isDecorator = Util.isClassDecorator(...arguments);
  const deco = function(Target) {
    // configure the remote path for the Entity
    const defaultPath = () => Target.name.toLowerCase(); // FIXME warn Function.name
    let path;
    let nonPersistent = false;
    if (isDecorator) {
      path = defaultPath();
    } else {
      let options = typeof optionsOrTarget === 'string' ?
          {path: optionsOrTarget} : optionsOrTarget || {};
      path = options.path || defaultPath();
      nonPersistent = options.nonPersistent || false;
    }
    const config = PersistentConfig.get(Target);
    config.configure({path, nonPersistent});
    return PersistentObject.byDecoration(Target);
  };
  return isDecorator ? deco(optionsOrTarget) : deco;
}
