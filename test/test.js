import {Entity} from '../src/decorator/entity';
import {Id} from '../src/decorator/id';
import {Property} from '../src/decorator/property';
import {PostLoad} from '../src/decorator/post-load';
import {PostUpdate} from '../src/decorator/post-update';
import {PreUpdate} from '../src/decorator/pre-update';
import {Temporal} from '../src/decorator/temporal';
import {Config} from '../src/config';
import {EntityManager} from '../src/entity-manager';

@Entity()
class Foo {
  @Id() id;
  @Property() bar;
  @Property('some.nested.value') baz;

  @Temporal() time;

  @PostLoad()
  postLoad() {
    console.log('Post Load!');
  }

  @PreUpdate()
  preUpdate(prop, newVal, oldVal) {
    let ok = true; // change me if you want! :-)
    console.log(`Pre Update${ok ? '' : ' rejects'}!`, ...arguments);
    return ok;
  }

  @PostUpdate()
  postUpdate(prop, newVal, oldVal) {
    console.log('Post Update!', ...arguments);
  }
}


async function run() {
  let config = Config.create();
  let em = new EntityManager(config);

  let raw = {};
  let foo = await em.create(Foo, raw);

  console.log(foo, raw);
  window.foo = foo;
  window.raw = raw;

  foo.bar = 'bar';
  foo.baz = 'baz';
}

run();
