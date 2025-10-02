export class CreateModuleReleaseDto {
  moduleId: string;   // référence à un Module
  tagId: string;      // référence à un Tag
  releaseId: string;  // référence à une Release - obligatoire
}
