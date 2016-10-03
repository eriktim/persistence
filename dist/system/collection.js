'use strict';

System.register(['./decorator/collectible', './persistent-object', './persistent-data', './symbols'], function (_export, _context) {
  "use strict";

  var isCollectible, PersistentObject, PersistentData, VERSION, _createClass, _get, configMap, Collection, CollectionFactory;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  function _extendableBuiltin(cls) {
    function ExtendableBuiltin() {
      var instance = Reflect.construct(cls, Array.from(arguments));
      Object.setPrototypeOf(instance, Object.getPrototypeOf(this));
      return instance;
    }

    ExtendableBuiltin.prototype = Object.create(cls.prototype, {
      constructor: {
        value: cls,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });

    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(ExtendableBuiltin, cls);
    } else {
      ExtendableBuiltin.__proto__ = cls;
    }

    return ExtendableBuiltin;
  }

  function setCollectionData(collection, array) {
    var config = configMap.get(collection);
    config.silent = true;
    if (config.array) {
      if (config.array === array) {
        return;
      }
      collection.clear();
    }
    config.array = array;
    array.splice(0, array.length).forEach(function (data) {
      var item = new config.Type();
      PersistentData.inject(item, data);
      collection.add(item);
    });
    config.silent = false;
  }

  _export('setCollectionData', setCollectionData);

  function versionUp(target) {
    if (target) {
      target[VERSION]++;
    }
  }

  function getArrayForTesting(collection) {
    var config = configMap.get(collection);
    return config ? config.array : undefined;
  }

  _export('getArrayForTesting', getArrayForTesting);

  return {
    setters: [function (_decoratorCollectible) {
      isCollectible = _decoratorCollectible.isCollectible;
    }, function (_persistentObject) {
      PersistentObject = _persistentObject.PersistentObject;
    }, function (_persistentData) {
      PersistentData = _persistentData.PersistentData;
    }, function (_symbols) {
      VERSION = _symbols.VERSION;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _get = function get(object, property, receiver) {
        if (object === null) object = Function.prototype;
        var desc = Object.getOwnPropertyDescriptor(object, property);

        if (desc === undefined) {
          var parent = Object.getPrototypeOf(object);

          if (parent === null) {
            return undefined;
          } else {
            return get(parent, property, receiver);
          }
        } else if ("value" in desc) {
          return desc.value;
        } else {
          var getter = desc.get;

          if (getter === undefined) {
            return undefined;
          }

          return getter.call(receiver);
        }
      };

      configMap = new WeakMap();

      Collection = function (_extendableBuiltin2) {
        _inherits(Collection, _extendableBuiltin2);

        function Collection() {
          _classCallCheck(this, Collection);

          return _possibleConstructorReturn(this, (Collection.__proto__ || Object.getPrototypeOf(Collection)).apply(this, arguments));
        }

        _createClass(Collection, [{
          key: 'newItem',
          value: function newItem() {
            var config = configMap.get(this);
            var item = new config.Type();
            this.add(item);
            return item;
          }
        }, {
          key: 'add',
          value: function add(item) {
            var config = configMap.get(this);
            if (!(item instanceof config.Type)) {
              throw new TypeError('collection item must be of type \'' + config.Type.name + '\'');
            }
            var data = PersistentData.extract(item) || {};
            config.array.push(data);
            PersistentObject.apply(item, data, config.target);
            _get(Collection.prototype.__proto__ || Object.getPrototypeOf(Collection.prototype), 'add', this).call(this, item);
            if (!config.silent) {
              versionUp(config.target);
            }
            return this;
          }
        }, {
          key: 'clear',
          value: function clear() {
            var config = configMap.get(this);
            config.array.splice(0, config.array.length);
            _get(Collection.prototype.__proto__ || Object.getPrototypeOf(Collection.prototype), 'clear', this).call(this);
            if (!config.silent) {
              versionUp(config.target);
            }
          }
        }, {
          key: 'delete',
          value: function _delete(item) {
            var config = configMap.get(this);
            var data = PersistentData.extract(item);
            var index = config.array.indexOf(data);
            config.array.splice(index, 1);
            var deleted = _get(Collection.prototype.__proto__ || Object.getPrototypeOf(Collection.prototype), 'delete', this).call(this, item);
            versionUp(config.target);
            return deleted;
          }
        }]);

        return Collection;
      }(_extendableBuiltin(Set));

      _export('CollectionFactory', CollectionFactory = function () {
        function CollectionFactory() {
          _classCallCheck(this, CollectionFactory);
        }

        _createClass(CollectionFactory, null, [{
          key: 'create',
          value: function create(Type, array, target) {
            if (!isCollectible(Type)) {
              throw new TypeError('collection type must be @Collectible');
            }
            var collection = new Collection();
            configMap.set(collection, {
              Type: Type,
              silent: false,
              target: target
            });
            setCollectionData(collection, array);
            return collection;
          }
        }]);

        return CollectionFactory;
      }());

      _export('CollectionFactory', CollectionFactory);
    }
  };
});