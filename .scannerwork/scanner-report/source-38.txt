import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ReleasesService } from './releases.service';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';

@Controller('releases')
export class ReleasesController {
  constructor(private readonly releasesService: ReleasesService) {}

  @Post()
  create(@Body() createReleaseDto: CreateReleaseDto) {
    return this.releasesService.create(createReleaseDto);
  }

  @Get()
  findAll() {
    return this.releasesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.releasesService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateReleaseDto: UpdateReleaseDto) {
    return this.releasesService.update(id, updateReleaseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.releasesService.remove(id);
  }

  @Delete()
  removeAll() {
    return this.releasesService.removeAll();
  }

  @Post('full-upload')
  async fullUpload(
    @Body('name') name: string,
    @Body('author') author: string,
    @Body('changelogGlobal') changelogGlobal: string,
    @Body('moduleReleases') moduleReleases?: string,
  ) {
    let moduleReleasesParsed = undefined;
    if (moduleReleases) {
      try {
        moduleReleasesParsed = JSON.parse(moduleReleases);
      } catch {}
    }
    return this.releasesService.create({
      name,
      author,
      changelogGlobal,
      moduleReleases: moduleReleasesParsed,
    });
  }
}
