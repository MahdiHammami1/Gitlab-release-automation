import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleReleaseDto } from './dto/create-module-release.dto';
import { UpdateModuleReleaseDto } from './dto/update-module-release.dto';

@Injectable()
export class ModuleReleasesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateModuleReleaseDto) {
    try {
      return await this.prisma.moduleRelease.create({ data: dto });
    } catch (error) {
      console.error('Database error:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to create module release',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
      console.error('Database error:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to retrieve module releases',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.moduleRelease.findUnique({
        where: { id },
        include: {
          module: true,
          tag: true,
          artefacts: true,
          release: true,
        },
      });
    } catch (error) {
      console.error('Database error:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to retrieve module releases',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, data: UpdateModuleReleaseDto) {
    try {
      return await this.prisma.moduleRelease.update({ where: { id }, data });
    } catch (error) {
      console.error('Database error:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to retrieve module releases',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.moduleRelease.delete({ where: { id } });
    } catch (error) {
      console.error('Database error:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to retrieve module releases',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async exists(dto: CreateModuleReleaseDto) {
    try {
      return await this.prisma.moduleRelease.findFirst({ where: dto });
    } catch (error) {
      console.error('Database error:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to check existence of module release',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
