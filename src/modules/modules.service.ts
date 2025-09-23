import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModulesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  create(data: CreateModuleDto) {
    return this.prisma.module.create({ data });
  }

  async findAll() {
    try {
      return await this.prisma.module.findMany();
    } catch (error) {
      console.error('Database error:', error);
      throw new HttpException('Failed to retrieve modules', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  findOne(id: string) {
    return this.prisma.module.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateModuleDto) {
    return this.prisma.module.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.module.delete({ where: { id } });
  }

  /**
   * Crée un module à partir d'un repo GitLab (en récupérant le nom via l'API GitLab)
   * @param repoUrl URL du repo GitLab (ex: https://gitlab.com/monorg/monrepo)
   */

}
