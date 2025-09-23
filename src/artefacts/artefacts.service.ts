import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArtefactDto } from './dto/create-artefact.dto';
import { UpdateArtefactDto } from './dto/update-artefact.dto';

@Injectable()
export class ArtefactsService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateArtefactDto) {
    return this.prisma.artefact.create({ data });
  }

  async findAll() {
    try {
      return await this.prisma.artefact.findMany();
    } catch (error) {
      throw error;
    }
  }

  findOne(id: string) {
    return this.prisma.artefact.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateArtefactDto) {
    return this.prisma.artefact.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.artefact.delete({ where: { id } });
  }
}
