import {Config, resetGlobalConfigForTesting} from '../../src/config';

describe('Config', () => {
  beforeEach(() => {
    resetGlobalConfigForTesting();
  });

  it('Create', () => {
    Config.create();
    Config.create({});
  });

  it('Configure', () => {
    let config = Config.create();
    config.configure();
    config.configure({});
  });

  it('Current', () => {
    let config = Config.create();
    let current = config.current;
    expect(Object.isExtensible(current)).toBeFalsy();
    expect(current === config.current).toBeFalsy();
  });

  it('Default', () => {
    expect(Config.getDefault()).toBeUndefined();
    Config.create();
    expect(Config.getDefault()).toEqual(jasmine.any(Config));
  });

  it('Property decorator', () => {
    expect(Config.getPropertyDecorator()).toBeUndefined();

    expect(() => Config.setPropertyDecorator('foo'))
        .toThrowError('property decorator must be a function');

    let propertyDecorator = function() {};
    Config.setPropertyDecorator(propertyDecorator);
    expect(Config.getPropertyDecorator()).toEqual(propertyDecorator);
  });

  afterEach(() => {
    resetGlobalConfigForTesting();
  });
});
