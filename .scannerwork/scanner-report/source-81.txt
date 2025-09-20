import { UsersModule } from './users.module';
describe('UsersModule', () => {
  it('should be defined', () => {
    expect(new UsersModule()).toBeDefined();
  });

  it('should be instantiable without error', () => {
    expect(() => new UsersModule()).not.toThrow();
  });

  it('should be an instance of UsersModule', () => {
    const module = new UsersModule();
    expect(module).toBeInstanceOf(UsersModule);
  });
});
