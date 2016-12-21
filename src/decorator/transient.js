export function Transient(): PropertyDecorator {
  return function(target: PObject, propertyKey: PropertyKey) {
    Object.defineProperty(target, propertyKey, {
      writable: true,
      value: undefined,
      enumerable: true,
      configurable: true
    });
  };
}
