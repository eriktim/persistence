import {Util} from '../util';

export function PrePersist(): MethodDecorator {
  return Util.createHookDecorator('prePersist');
}
