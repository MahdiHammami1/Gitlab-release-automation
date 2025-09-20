import { TagsModule } from './tags.module';
describe('TagsModule', () => {
  it('should be defined', () => {
    expect(new TagsModule()).toBeDefined();
  });

  it('should be instantiable without error', () => {
    expect(() => new TagsModule()).not.toThrow();
  });

  it('should be an instance of TagsModule', () => {
    const module = new TagsModule();
    expect(module).toBeInstanceOf(TagsModule);
  });
});
