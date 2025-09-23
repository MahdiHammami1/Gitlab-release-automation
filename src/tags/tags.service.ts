import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TagsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly httpService: HttpService
  ) {}

  create(data: CreateTagDto) {
    if (!data.name) {
      throw new Error('Le champ name est obligatoire pour créer un tag.');
    }
    return this.prisma.tag.create({ data });
  }

  async findAll() {
    try {
      return await this.prisma.tag.findMany();
    } catch (error) {
      console.error('Database error:', error);
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        'Failed to retrieve tags',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findOne(id: string) {
    return this.prisma.tag.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateTagDto) {
    return this.prisma.tag.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.tag.delete({ where: { id } });
  }
  /**
   * Crée un tag à partir d'un repo GitLab et d'un tagName
   * @param repoUrl URL du repo GitLab (ex: https://gitlab.com/myorg/auth-service.git)
   * @param tagName le nom du tag GitLab (ex: v1.0.0)
   */
  async createFromGitlab(repoUrl: string, tagName: string) {
    // Extraire chemin du projet
    const match = repoUrl.match(/gitlab\.com\/([^/]+\/[^/]+)(?:\.git)?$/);
    if (!match) {
      throw new HttpException('URL GitLab invalide', HttpStatus.BAD_REQUEST);
    }
    const projectPath = match[1];

    // Construire URL proxy GitLab
    const apiUrl = `http://localhost:3000/gitlab/projects/${encodeURIComponent(
        projectPath
    )}/repository/tags/${encodeURIComponent(tagName)}`;

    let tag;
    try {
      const response = await firstValueFrom(this.httpService.get(apiUrl));
      tag = response.data;
    } catch (error) {
      console.error('Erreur API GitLab:', apiUrl, error?.response?.data || error.message);
      throw new HttpException(
          error?.response?.data?.message || 'Erreur GitLab API',
          error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (!tag || !tag.name) {
      throw new HttpException('Tag GitLab introuvable', HttpStatus.NOT_FOUND);
    }

    // Vérifier en DB
    const existing = await this.prisma.tag.findFirst({
      where: { name: tag.name, commitHash: tag.commit.id },
    });
    if (existing) return existing;

    // Créer en DB
    return this.prisma.tag.create({
      data: {
        name: tag.name,
        link: `https://gitlab.com/${projectPath}/-/commit/${tag.commit.id}`,
        commitHash: tag.commit.id,
        author: tag.commit.author_name,
      },
    });
  }
}
