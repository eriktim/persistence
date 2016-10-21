# Persistence

> Inspired by the Java Persistence API



## Example

    @Embeddable
    class Size {
      x = undefined;
      y = undefined;
      z = undefined;

      @Transient volume;

      @PostUpdate
      setVolume() {
        this.volume = calcVolume(x, y, z);
      }
    }

    @Entity('egg')
    class Egg {
      @Id id;

      @Embedded(Size)
      size;
    }

    @Entity('chicken')
    class Chicken {
      @Id id;

      @Property('familyName')
      name;

      @ManyToOne(Egg)
      eggs;

      @PostCreate
      onCreate() {
        this.name = getRandomName();
      }
    }



## Docs

Note that any decorator that does not require an argument can be used both by `@Decorator` and `@Decorator()`.


### Class decorators

#### `@Entity(remotePath?: string)`

This decorator turns any class into an entity, i.e. it allows you to make REST calls with it.

* `remotePath` is the path on the REST server, e.g. entities from a class can be fetched by sending `GET http://restserver.my/remotePath`. By default the `remotePath` is the name of the class. Note that this may cause issues when used with minification.

#### `@Collectible`

This decorator turns any class into a collectible object. This is required when adding a collection to an entity. See also `@Collection`.

#### `@Embeddable`

This decorator turns any class into an embeddable object. This is required when embedding objects in entities or objects. See also `@Embedded`.


###  Field decorators

#### `@Collection(Type: Class)`

Turn a class field into a `Collection`. `Collection` is a subclass of the `Set` and only adds a method `newItem()` which allows creating new items in the collection (of the same type as the others).

* `Type` any class having the `@Collectible` decorator.

#### `@Embedded(Type: Class)`

Embed an object into another object or entity class. This differs with `@OneToOne` in the sense that the object data is stored with the entity itself.

* `Type` any class having the `@Embeddable` decorator.

#### `@Id`

Make a property the primary key for an entity. This key is used as the endpoint on the REST server, e.g. `GET http://restserver.my/entity/123` will map a class to the entity with id `123`.

#### `@ManyToOne(Type: Class)`

(To be implemented)

#### `@OneToOne(Type: Class)`

This decorator allows references between entities. Reading its value always return a `Promise`. Depending on the cache of the `ResourceManager` the REST server can be requested for this entity. This differs with `@Embedded` in the sense that the object data is not stored with the entity itself.

* `Type` must be an entity class or the string `'self'`, allowing self-reference.

#### `@Property(path?: string)`

Currently, a class field needs to be initialized to make it persistent, this can be done by:
* initializing it with any value, e.g. `undefined`;
* decorating it using `@Property`.

This is ought to change in a future version of ECMAScript and is the aimed direction for this library.
`@Property` can also be used to map a class field name to a different property name on the REST server.

* `path` is the property path on the REST server. By default it is equal to the field property name itself. If the path does not exist, it will be created when _writing_ a value. The string allows:
    - nested objects by using `.` as a separator: `some.nested.path` maps to `{some: {nested: {path: <val>}}}`;
    - simple arrays by using specifying an index: `elements[0].foo` maps to `{elements: [{foo: <val>}]}`;
    - advanced arrays by mapping the index by object properties: `elements[key=foo].value` maps to `{elements: [{key: "foo", value: <val>}]}`.

#### `@Temporal(format?: string)`

Temporal maps a class field to a date and/or time object. For this, it uses [Moment](<http://momentjs.com/).

* `format` is a string describing the timestamp, see [string format](http://momentjs.com/docs/#/parsing/string-format/). By default the ISO 8601 is used. The Persistence library provides a `TemporalFormat` object containing the allowed values.

#### `@Transient`

As explained in `@Property`, this library aims to have property made persistent by default. This decorator allows to disable this for a specific class field.

### Method decorators

Note that all method decorators converts methods into hooks, used internally by Persistence.
The original class properties are overwritten by `undefined`.

#### `@PostLoad`

This hook is run after (re-)loading data from the REST server and after creating a new entity. When loading an existing entity, this means a `GET` request was send to the REST server.

#### `@PostPersist`

This hook is run after persisting a new or existing entity into the REST server. This means either a `PUT` or `POST` request was send to the REST server.

#### `@PostRemove`

This hook is run after removing a new or existing entity into the REST server. For an existing entity, this means a `DELETE` request has been send to the REST server.

#### `@PostUpdate`

(To be implemented)

#### `@PrePersist`

This hook is run just before sending a `PUT` or ` POST` request for a new or existing entity to the REST server.

#### `@PreRemove`

This hook is run just before sending a `DELETE` request for an existing entity to the REST server.

#### `@PreUpdate`

(To be implemented)


### Entity Manager

The `EntityManager` is used for automating REST calls.

#### `EntityManager(config?: Config)`

Create a new instance of the `EntityManager`.

* `config` is a configuration object. When left out, the default `Config` instance is used, which _must_ have been initialized. See the next section for more information

#### `.clear()`

Clear the cache.

#### `.contains(entity: Class)`

Check whether an object is managed by this entity manager.

* `entity` is the object to check.

#### `.create(Type: Class, data: Object)`

Create a new instance of an entity.

* `Type` is the entity class;
* `data` is the raw entity data to initialize the entity with. When unsure, use `{}`.

#### `.detach(entity: Class)`

Tell the entity manager to stop managing an entity.

* `entity` is the entity to detach.

#### `.find(Type: Class, id: string|number)`

Find an entity and create an instance. Will send `GET http://restserver.my/<entity>/<id>`.

* `Type` is the entity class;
* `id` is the primary key of the object.

#### `.query(Type: Class, params: string|Object)`

Find entities and create instances. Will send `GET http://restserver.my/<entity>/?<query>`.

* `Type` is the entity class;
* `params` is either a string that is appended to the `GET` request or an object which is mapped to string by `key1=value1&key2=value2`.

#### `.persist(entity: Class)`

Save the instance of an entity. Will send `POST http://restserver.my/<entity>` for new entities or `PUT http://restserver.my/<entity>/<id>` for existing ones.

* `entity` is the instance to be persisted.

#### `.refresh(entity: Class, reload?: boolean)`

Refresh the instance of an entity.

* `entity` is the instance to be refreshed;
* When `reload` is `true` the instance is refreshed by reloading the data from the REST server.

#### `.remove(entity: Class)`

Remove an entity. Will send `DELETE http://restserver.my/<entity>/<id>`.

* `entity` is the instance to be removed.

### Configuration
