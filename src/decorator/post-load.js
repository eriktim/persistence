import {Util} from '../util';

export function PostLoad(): MethodDecorator {
  return Util.createHookDecorator('postLoad');
}
