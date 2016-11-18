interface ICollectible {}

interface IEmbeddable {}

interface IEntity {}

export declare function Collectible(): any;

export declare function Collection(Target: ICollectible): any;

export declare function Embeddable(): any;

export declare function Embedded(Target: IEmbeddable): any;

export declare function Entity(path?: string): any;

export declare function Id(): any;

export declare function OneToOne(Target: IEntity): any;

export declare function PostLoad(): any;

export declare function PostPersist(): any;

export declare function PostRemove(): any;

export declare function PrePersist(): any;

export declare function PreRemove(): any;

export declare function Property(path?: string): any;

export declare function Temporal(): any;

export declare function Transient(): any;

export enum TemporalFormat {
  DEFAULT = <any>'YYYY-MM-DDTHH:mm:ssZ',
  DATETIME = <any>'YYYY-MM-DD HH:mm:ss',
  DATE = <any>'YYYY-MM-DD',
  TIME = <any>'HH:mm:ss'
}

export interface IConfigOptions {
  baseUrl: string,
  extensible?: boolean,
  fetchInterceptor?: Function,
  onNewObject?: Function,
  queryEntityMapperFactory?: Function
}

export interface ICollection<T> extends Set {
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
  create(Entity: IEntity, data?: any): Promise<IEntity>;
  detach(entity: IEntity): boolean;
  find(Entity: IEntity, id: string|number): Promise<IEntity>;
  query(Entity: IEntity, params: string|any): Promise<IEntity[]>;
  persist(entity: IEntity): Promise<IEntity>;
  refresh(entity: IEntity): Promise<IEntity>;
  remove(entity: IEntity): Promise<IEntity>;
}
