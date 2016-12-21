export const objectHandler = {
  get: function (target, property) {
    const config = PersistentConfig.get(target.constructor);
    const propConfig = config.getProperty(property);
    if (propConfig) {
      return PersistentData.getProperty(this, config.fullPath);
    } else {
      return target[property];
    }
  },
  set: function (target, property, value) {
    const config = PersistentConfig.get(target.constructor);
    const propConfig = config.getProperty(property);
    if (propConfig) {
      if (propConfig.type === PropertyType.ID) {
        throw new Error('cannot set server-generated id');
      }
      return PersistentData.setProperty(this, config.fullPath, value);
    } else {
      target[property] = value;
    }
    return true;
  }
};
