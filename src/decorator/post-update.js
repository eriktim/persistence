import {Util} from '../util';

export function PostUpdate(): MethodDecorator {
  return Util.createHookDecorator('postUpdate');
}
