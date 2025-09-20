import { ArtefactEntity } from './artefact.entity';
describe('ArtefactEntity', () => {
  it('should be defined', () => {
    expect(new ArtefactEntity()).toBeDefined();
  });

  it('should assign all properties correctly', () => {
    const artefact = new ArtefactEntity();
    artefact.id = '1';
    artefact.name = 'artefact-test';
    artefact.url = 'http://test.com';
    artefact.type = 'binary';
    artefact.moduleReleaseId = 'mod-1';
    expect(artefact.id).toBe('1');
    expect(artefact.name).toBe('artefact-test');
    expect(artefact.url).toBe('http://test.com');
    expect(artefact.type).toBe('binary');
    expect(artefact.moduleReleaseId).toBe('mod-1');
  });

  it('should allow moduleReleaseId to be undefined', () => {
    const artefact = new ArtefactEntity();
    artefact.id = '2';
    artefact.name = 'no-module';
    artefact.url = 'http://no-module.com';
    artefact.type = 'source';
    expect(artefact.moduleReleaseId).toBeUndefined();
  });
});
