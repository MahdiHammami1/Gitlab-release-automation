import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModulesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService
  ) {}

  create(data: CreateModuleDto) {
    return this.prisma.module.create({ data });
  }

  findAll() {
    return this.prisma.module.findMany();
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
  async createFromGitlab(repoUrl: string) {
    // Extraire le chemin du projet à partir de l'URL GitLab
    const match = repoUrl.match(/gitlab.com\/(.+?)(?:\.git)?$/);
    if (!match) {
      throw new Error('URL GitLab invalide');
    }
    const projectPath = match[1];

    // Appel à ton API proxy vers GitLab
    const apiUrl = `http://localhost:3000/gitlab/projects/${encodeURIComponent(projectPath)}`;

    let project;
    try {
      const response = await firstValueFrom(this.httpService.get(apiUrl));
      project = response.data;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du projet GitLab: ${error.message}`);
    }

    if (!project || !project.name) {
      throw new Error('Projet GitLab introuvable');
    }

    // Vérifier si le module existe déjà
    const existing = await this.prisma.module.findFirst({
      where: { repoUrl },
    });
    if (existing) return existing;

    // Créer le module dans la base
    return this.prisma.module.create({
      data: {
        name: project.name,
        repoUrl,
      },
    });
  }
}
