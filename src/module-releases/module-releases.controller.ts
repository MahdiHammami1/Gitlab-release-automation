import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ModuleReleasesService } from './module-releases.service';
import { CreateModuleReleaseDto } from './dto/create-module-release.dto';
import { UpdateModuleReleaseDto } from './dto/update-module-release.dto';

@Controller('module-releases')
export class ModuleReleasesController {
  constructor(private readonly moduleReleasesService: ModuleReleasesService) {}

  @Post()
  async create(@Body() createModuleReleaseDto: CreateModuleReleaseDto) {
    // Vérification d'existence avant création
    const exists = await this.moduleReleasesService.exists(createModuleReleaseDto);
    if (exists) {
      return { message: 'ModuleRelease déjà existant', moduleRelease: exists };
    }
    return this.moduleReleasesService.create(createModuleReleaseDto);
  }

  @Get()
  findAll() {
    return this.moduleReleasesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moduleReleasesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateModuleReleaseDto: UpdateModuleReleaseDto) {
    return this.moduleReleasesService.update(id, updateModuleReleaseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moduleReleasesService.remove(id);
  }
}
