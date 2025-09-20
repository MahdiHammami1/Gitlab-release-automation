import { AuthModule } from './auth.module';
describe('AuthModule', () => {
  it('should be defined', () => {
    expect(new AuthModule()).toBeDefined();
  });

  it('should be instantiable without error', () => {
    expect(() => new AuthModule()).not.toThrow();
  });

  it('should be an instance of AuthModule', () => {
    const module = new AuthModule();
    expect(module).toBeInstanceOf(AuthModule);
  });
});
