import {Entity} from '../src/decorator/entity';
import {Config} from '../src/config';
import {EntityManager} from '../src/entity-manager';

@Entity()
class Foo {}


async function run() {
  let config = Config.create();
  let em = new EntityManager(config);

  let foo = await em.create(Foo);
}

run();
