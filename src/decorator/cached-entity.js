import {PersistentConfig} from '../persistent-config';
import {Util} from '../util';

export function CachedEntity(pathOrTarget) {
  const isDecorator = Util.isClassDecorator(...arguments);
  const deco = function(Target) {
    // FIXME warn Function.name
    const defaultPath = () => Target.name.toLowerCase();
    let path = isDecorator ? defaultPath() : pathOrTarget || defaultPath();
    const config = PersistentConfig.get(Target);
    config.configure({
      path,
      cacheOnly: true,
      nonPersistent: true
    });
  };
  return isDecorator ? deco(pathOrTarget) : deco;
}
