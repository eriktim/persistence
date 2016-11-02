import {Util} from './util';

export const ENTITY_MANAGER = '__entityManager__';
export const PARENT = '__parent__';
export const RELATIONS = '__relations__';
export const REMOVED = '__removed__';
export const VERSION = '__version__';

export function defineSymbol(
    obj, symbol, descriptor = {}) {
  if (!Util.isObject(descriptor)) {
    descriptor = {value: descriptor};
  }
  Reflect.defineProperty(obj, symbol, Object.assign({
    configurable: true,
    enumerable: false,
    writable: true,
    value: undefined
  }, descriptor));
}
