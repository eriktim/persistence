// TODO metadata
export const ENTITY_MANAGER: string = '__entityManager__';
export const PARENT: string = '__parent__';
export const RELATIONS: string = '__relations__';
export const REMOVED: string = '__removed__';
export const VERSION: string = '__version__';

export function defineSymbol(obj: Object,
                             symbol: string,
                             valueOrDesc: string|PropertyDescriptor = {}) {
  let descriptor = typeof valueOrDesc === 'string' ?
      {value: valueOrDesc} : valueOrDesc;
  Reflect.defineProperty(obj, symbol, Object.assign({
    configurable: true,
    enumerable: false,
    writable: true,
    value: undefined
  }, descriptor));
}
