import {Embeddable} from '../src/decorator/embeddable';
import {Embedded} from '../src/decorator/embedded';
import {Entity} from '../src/decorator/entity';
import {Id} from '../src/decorator/id';
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

@Entity()
class Foo {
  @Id() id;
  @Property() bar;
  @Property('some.nested.value') baz;
  @Embedded(Bar) obj;

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

  console.log(foo, raw);
  window.foo = foo;
  window.raw = raw;
  window.Bar = Bar;

  foo.bar = 'bar';
  foo.baz = 'baz';
  foo.obj.prop = 'prop';

  // reset
  setTimeout(() => {
    console.log('pre-reset', JSON.stringify(raw));
    PersistentObject.setData(foo, {});
    console.log('reset');
  }, 1000);
}

describe('Test', () => {
  it('run', () => {
    expect(run).not.toThrow();
  });
});
