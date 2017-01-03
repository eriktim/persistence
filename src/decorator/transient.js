export function Transient(): PropertyDecorator {
  return function(target: PObject, propertyKey: PropertyKey) {
    Object.defineProperty(target, propertyKey, {
      configurable: true,
      enumerable: true,
      writable: true,
      value: undefined
    });
  };
}
