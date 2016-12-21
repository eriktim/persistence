import {Util} from '../util';

export function PreRemove(): MethodDecorator {
  return Util.createHookDecorator('preRemove');
}
