interface ICollectible {}

interface IEmbeddable {}

interface IEntity {}

interface IRaw {}

interface Class<T> {
  new (): T;
}

export interface IConfigOptions {
  baseUrl: string,
  extensible?: boolean,
  fetchInterceptor?: Function,
  onNewObject?: Function,
  referenceToUri: (reference: any) => string,
  queryEntityMapperFactory?: Function
  uriToReference: (uri: string) => any
}


export interface IEntityOptions {
  path?: string,
  nonPersistent?: boolean
}

export declare function Collectible(): ClassDecorator;

export declare function Collection(Target: Class<ICollectible>): PropertyDecorator;

export declare function Embeddable(): ClassDecorator;

export declare function Embedded(Target: Class<IEmbeddable>): PropertyDecorator;

export declare function Entity(pathOrOptions?: string|IEntityOptions): ClassDecorator;

export declare function Id(): PropertyDecorator;

export declare function OneToOne(Target: Class<IEntity>): PropertyDecorator;

export declare function PostLoad(): MethodDecorator;

export declare function PostPersist(): MethodDecorator;

export declare function PostRemove(): MethodDecorator;

export declare function PrePersist(): MethodDecorator;

export declare function PreRemove(): MethodDecorator;

export declare function Property(path?: string): PropertyDecorator;

export declare function Temporal(format?: TemporalFormatString): PropertyDecorator;

export declare function Transient(): PropertyDecorator;

type TemporalFormatString = string;

export interface TemporalFormat {
  DEFAULT: TemporalFormatString,
  DATETIME: TemporalFormatString,
  DATE: TemporalFormatString,
  TIME: TemporalFormatString
}

export interface ICollection<T> extends Set<T> {
  newItem(): T;
}

export declare class Config {
  static create(config: IConfigOptions): Config;
  configure(config: IConfigOptions): void;
}

export declare class EntityManager {
  constructor(config?: Config);
  clear(): void;
  contains(entity: IEntity): boolean;
  create<T extends IEntity>(Entity: Class<T>, data?: IRaw): Promise<T>;
  detach(entity: IEntity): boolean;
  find<T extends IEntity>(Entity: Class<T>, id: string|number): Promise<T>;
  query<T extends IEntity>(Entity: Class<T>, params?: string|any): Promise<T[]>;
  persist<T extends IEntity>(entity: T): Promise<T>;
  refresh<T extends IEntity>(entity: T): Promise<T>;
  remove<T extends IEntity>(entity: T): Promise<T>;
}
