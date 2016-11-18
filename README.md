Persistence
===========

> Inspired by the Java Persistence API

    @Embeddable
    class Size {
      @Property x;
      @Property y;
      @Property z;
      
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
