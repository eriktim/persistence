export class Util {
  static mergeDescriptors(infDescriptor, supDescriptor) {
    let descriptor = {
      enumerable: 'enumerable' in infDescriptor ?
          infDescriptor.enumerable : true,
      configurable: 'configurable' in infDescriptor ?
          infDescriptor.configurable : true
    };
    if ('set' in supDescriptor || 'get' in supDescriptor) {
      let setter = supDescriptor.set || infDescriptor.set;
      let getter = supDescriptor.get || supDescriptor.get;
      if ('set' in infDescriptor && 'set' in supDescriptor) {
        setter = function(value) {
          infDescriptor.set(value);
          supDescriptor.set(value);
        };
      }
      if ('get' in infDescriptor && 'get' in supDescriptor) {
        getter = function() {
          infDescriptor.get();
          return supDescriptor.get();
        };
      }
      descriptor.set = setter || undefined;
      descriptor.get = getter || undefined;
    } else {
      descriptor.value = 'value' in supDescriptor ?
          supDescriptor.value : undefined;
      descriptor.writable = 'writable' in supDescriptor ?
          supDescriptor.writable : true;
    }
    return descriptor;
  }

  static getClass(target) {
    if (Util.isClass(target)) {
      // taking the prototype filters out proxies
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
    return typeof value === 'object' && value !== null &&
        !Array.isArray(value);
  }

  static isPropertyDecorator(target, propertyKey, descriptor) {
    return arguments.length === 3 &&
        Util.isObject(target) &&
        typeof propertyKey === 'string' && propertyKey !== '' &&
        Util.isObject(descriptor);
  }
}
