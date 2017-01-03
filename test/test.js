import {Collectible} from '../src/decorator/collectible';
import {Collection} from '../src/decorator/collection';
import {Embeddable} from '../src/decorator/embeddable';
import {Embedded} from '../src/decorator/embedded';
import {Entity} from '../src/decorator/entity';
import {Id} from '../src/decorator/id';
import {OneToOne} from '../src/decorator/one-to-one';
import {Property} from '../src/decorator/property';
import {PostLoad} from '../src/decorator/post-load';
import {PostUpdate} from '../src/decorator/post-update';
import {PreUpdate} from '../src/decorator/pre-update';
import {Temporal} from '../src/decorator/temporal';
import {Config} from '../src/config';
import {PersistentObject} from '../src/persistent-object';
import {EntityManager} from '../src/entity-manager';

@Embeddable()
class Bar {
  @Property() prop;
}

@Collectible()
class Baz {
  @Property() prop;
}

@Entity()
class Ref {
  @Id() id;
  @Property() prop;
}

@Entity()
class Foo {
  @Id() id;
  @Property() bar;
  @Property('some.nested.value') nested;
  @Embedded(Bar) obj;
  @Collection(Baz) arr;
  @OneToOne(Ref) ref;

  @Temporal() time;

  @PostLoad()
  postLoad() {
    console.log('Post Load!');
  }

  @PreUpdate()
  preUpdate() {
    console.log('Pre Update!');
  }

  @PostUpdate()
  postUpdate() {
    console.log('Post Update!');
  }
}


async function run() {
  let config = Config.create();
  let em = new EntityManager(config);

  let raw = {};
  let foo = await em.create(Foo, raw);
  let ref = await em.create(Ref, {id: 12, prop: 'prop'});

  console.log('foo=', foo, 'ref=', ref, 'raw=', raw);
  window.foo = foo;
  window.ref = ref;
  window.raw = raw;
  window.Bar = Bar;

  foo.bar = 'bar';
  foo.nested = 'nested';
  foo.obj.prop = 'prop';

  let baz = new Baz();
  baz.prop = 'z1';
  foo.arr.push(baz);
  foo.arr.push(new Baz(), new Baz(), new Baz());

  foo.ref = ref;

  // reset
  return new Promise(resolve => {
    setTimeout(() => {
      console.log('pre-reset', JSON.stringify(raw));
      PersistentObject.setData(foo, {});
      console.log('reset');
      resolve();
    }, 1000);
  });
}

describe('Test', () => {
  it('run', () => {
    return run();
  });
});
