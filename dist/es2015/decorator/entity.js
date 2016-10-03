import { PersistentConfig } from '../persistent-config';
import { PersistentObject } from '../persistent-object';
import { Util } from '../util';

export function Entity(pathOrTarget) {
  const isDecorator = Util.isClassDecorator(...arguments);
  const deco = function (Target) {
    const defaultPath = Target.name.toLowerCase();
    const path = isDecorator ? defaultPath : pathOrTarget || defaultPath;
    const config = PersistentConfig.get(Target);
    config.configure({ path });
    return PersistentObject.byDecoration(Target);
  };
  return isDecorator ? deco(pathOrTarget) : deco;
}