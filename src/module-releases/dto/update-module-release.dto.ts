import { PartialType } from '@nestjs/mapped-types';
import { CreateModuleReleaseDto } from './create-module-release.dto';

export class UpdateModuleReleaseDto extends PartialType(CreateModuleReleaseDto) {}
