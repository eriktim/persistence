import {Util} from '../util';

export function PostPersist(): MethodDecorator {
  return Util.createHookDecorator('postPersist');
}
