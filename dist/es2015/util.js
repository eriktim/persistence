export let Util = class Util {
  static getClass(target) {
    if (Util.isClass(target)) {
      return target.prototype.constructor;
    }
    if (!Util.isObject(target)) {
      throw new Error('expected instance or class');
    }
    return target.constructor;
  }

  static is(value) {
    return value !== undefined && value !== null;
  }

  static isClass(value) {
    return typeof value === 'function';
  }

  static isClassDecorator(Target) {
    return Util.isClass(Target) && arguments.length === 1;
  }

  static isObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  static isPropertyDecorator(target, propertyKey, descriptor) {
    return arguments.length === 3 && Util.isObject(target) && typeof propertyKey === 'string' && propertyKey !== '' && Util.isObject(descriptor);
  }
};