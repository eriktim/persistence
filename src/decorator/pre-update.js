import {Util} from '../util';

export function PreUpdate(): MethodDecorator {
  return Util.createHookDecorator('preUpdate');
}
