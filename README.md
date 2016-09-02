Persistence JS
==============

> Inspired by the Java Persistence API

    @isEmbeddable
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
      
      @Property('family_name')
      name;
      
      @OneToMany(Egg)
      eggs;
      
      @PostCreate
      onCreate() {
        this.name = getRandomName();
      }
    }
