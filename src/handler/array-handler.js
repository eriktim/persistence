export const arrayHandler = {
  get: function(target, property) {
    return target[property];
  },
  set: function(target, property, value) {
    target[property] = value;
    return true;
  }
};
