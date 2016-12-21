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
