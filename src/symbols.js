export const ENTITY_MANAGER = '__entityManager__';
export const REMOVED = '__removed__';
export const VERSION = '__version__';

export function defineSymbol(obj, symbol, defaultValue = undefined) {
  Reflect.defineProperty(obj, symbol, {
    configurable: true,
    enumerable: false,
    writable: true,
    value: defaultValue
  });
}
