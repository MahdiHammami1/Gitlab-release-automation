import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleReleaseDto } from './dto/create-module-release.dto';
import { UpdateModuleReleaseDto } from './dto/update-module-release.dto';

@Injectable()
export class ModuleReleasesService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateModuleReleaseDto) {
    return this.prisma.moduleRelease.create({ data });
  }

  async findAll() {
    try {
      return await this.prisma.moduleRelease.findMany({
        include: {
          module: true,
          tag: true,
          artefacts: true,
          release: true,
        },
      });
    } catch (error) {
      throw error;
    }
  }

  findOne(id: string) {
    return this.prisma.moduleRelease.findUnique({
      where: { id },
      include: {
        module: true,
        tag: true,
        artefacts: true,
        release: true,
      },
    });
  }

  update(id: string, data: UpdateModuleReleaseDto) {
    return this.prisma.moduleRelease.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.moduleRelease.delete({ where: { id } });
  }

  /**
   * Vérifie si un module release existe déjà avec les mêmes clés
   */
  async exists(dto: { moduleId: string; tagId: string; releaseId?: string }) {
    return this.prisma.moduleRelease.findFirst({
      where: {
        moduleId: dto.moduleId,
        tagId: dto.tagId,
        releaseId: dto.releaseId ?? undefined,
      },
    });
  }
}
