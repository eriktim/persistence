import {Util} from '../util';

export function PostRemove(): MethodDecorator {
  return Util.createHookDecorator('postRemove');
}
