export interface ModuleReleaseCreateInput {
  moduleId: string;
  tagId: string;
}

export class CreateReleaseDto {
  name: string;
  author: string;
  changelogGlobal: string;
  moduleReleases?: ModuleReleaseCreateInput[];
}
