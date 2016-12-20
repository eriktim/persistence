export function Transient() {
  return function(target: any, propertyKey: PropertyKey) {
    Object.defineProperty(target, propertyKey, {
      writable: true,
      value: undefined,
      enumerable: true,
      configurable: true
    });
  };
}
