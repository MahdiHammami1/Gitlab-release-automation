import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ArtefactsService } from './artefacts.service';
import { CreateArtefactDto } from './dto/create-artefact.dto';
import { UpdateArtefactDto } from './dto/update-artefact.dto';

@Controller('artefacts')
export class ArtefactsController {
  constructor(private readonly artefactsService: ArtefactsService) {}

  @Post()
  create(@Body() createArtefactDto: CreateArtefactDto) {
    return this.artefactsService.create(createArtefactDto);
  }

  @Get()
  findAll() {
    return this.artefactsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.artefactsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateArtefactDto: UpdateArtefactDto) {
    return this.artefactsService.update(id, updateArtefactDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.artefactsService.remove(id);
  }
}

