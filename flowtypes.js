declare type PropertyKey = string|Symbol;

declare interface PropertyDescriptor {
  configurable?: boolean;
  enumerable?: boolean;
  value?: any;
  writable?: boolean;
  get? (): any;
  set? (v: any): void;
}

declare type ClassDecorator = (target: typeof Object) => typeof Object|void;

declare type PropertyDecorator = (target: Object, propertyKey: PropertyKey, descriptor?: PropertyDescriptor) => PropertyDescriptor|void;

declare type MethodDecorator = (target: Object, propertyKey: PropertyKey, descriptor?: PropertyDescriptor) => PropertyDescriptor|void;

interface ProxyHandler<T> {
  getPrototypeOf? (target: T): any;
  setPrototypeOf? (target: T, v: any): boolean;
  isExtensible? (target: T): boolean;
  preventExtensions? (target: T): boolean;
  getOwnPropertyDescriptor? (target: T, p: PropertyKey): PropertyDescriptor;
  has? (target: T, p: PropertyKey): boolean;
  get? (target: T, p: PropertyKey, receiver: any): any;
  set? (target: T, p: PropertyKey, value: any, receiver: any): boolean;
  deleteProperty? (target: T, p: PropertyKey): boolean;
  defineProperty? (target: T, p: PropertyKey, attributes: PropertyDescriptor): boolean;
  enumerate? (target: T): PropertyKey[];
  ownKeys? (target: T): PropertyKey[];
  apply? (target: T, thisArg: any, argArray?: any): any;
  construct? (target: T, thisArg: any, argArray?: any): any;
}

interface ProxyConstructor {
  revocable<T>(target: T, handler: ProxyHandler<T>): {proxy: T; revoke: () => void;};
  new <T>(target: T, handler: ProxyHandler<T>): T
}

declare let Proxy: ProxyConstructor;
