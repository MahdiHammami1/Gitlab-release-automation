export interface ModuleReleaseUpdateInput {
  moduleId: string;
  tagId: string;
}

export class UpdateReleaseDto {
  name?: string;
  author?: string;
  changelogGlobal?: string;
  moduleReleases?: ModuleReleaseUpdateInput[];
}
