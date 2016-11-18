declare type Class = any;
declare type EntityClass = any;
declare type Entity = any;

export declare function Collectible(): any;

export declare function Collection(Target: Class): any;

export declare function Embeddable(): any;

export declare function Embedded(Target: Class): any;

export declare function Entity(path?: string): any;

export declare function Id(): any;

export declare function OneToOne(Target: EntityClass): any;

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

export interface TypedCollection<T> extends Set {
  newItem(): T;
}

export declare class Config {
  static create(config: any): Config;
  configure(config: any): void;
}

export declare class EntityManager {
  constructor(config?: Config);
  clear(): void;
  contains(entity: Entity): boolean;
  create(Entity: EntityClass, data?: any): Promise<Entity>;
  detach(entity: Entity): boolean;
  find(Entity: EntityClass, id: string|number): Promise<Entity>;
  query(Entity: EntityClass, params: string|any): Promise<Entity[]>;
  persist(entity: Entity): Promise<Entity>;
  refresh(entity: Entity): Promise<Entity>;
  remove(entity: Entity): Promise<Entity>;
}
