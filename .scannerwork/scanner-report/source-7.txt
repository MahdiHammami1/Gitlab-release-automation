import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArtefactDto } from './dto/create-artefact.dto';
import { UpdateArtefactDto } from './dto/update-artefact.dto';

@Injectable()
export class ArtefactsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateArtefactDto) {
    try {
      return await this.prisma.artefact.create({ data });
    } catch (error) {
      console.error('Database error:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to create artefact',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    try {
      return await this.prisma.artefact.findMany();
    } catch (error) {
      console.error('Database error:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to retrieve artefacts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string) {
    try {
      return await this.prisma.artefact.findUnique({ where: { id } });
    } catch (error) {
      console.error('Database error:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to retrieve artefact',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, data: UpdateArtefactDto) {
    try {
      return await this.prisma.artefact.update({ where: { id }, data });
    } catch (error) {
      console.error('Database error:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to update artefact',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.artefact.delete({ where: { id } });
    } catch (error) {
      console.error('Database error:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to delete artefact',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
