import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReleaseDto } from './dto/create-release.dto';
import { UpdateReleaseDto } from './dto/update-release.dto';

@Injectable()
export class ReleasesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateReleaseDto) {
    return this.prisma.release.create({
      data: {
        name: data.name,
        author: data.author,
        changelogGlobal: Buffer.from(data.changelogGlobal, 'utf-8'),
        moduleReleases: data.moduleReleases
            ? {
              create: data.moduleReleases.map(mr => ({
                module: { connect: { id: mr.moduleId } },
                tag: { connect: { id: mr.tagId } },
              })),
            }
            : undefined,
      },
      include: { moduleReleases: true }
    });
  }

  async findAll() {
    try {
      return await this.prisma.release.findMany({
        include: {
          moduleReleases: {
            include: {
              module: true,
              tag: true,
              artefacts: true,
            },
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  findOne(id: string) {
    return this.prisma.release.findUnique({
      where: { id },
      include: {
        moduleReleases: {
          include: {
            module: true,
            tag: true,
            artefacts: true,
          },
        },
      },
    });
  }

  async update(id: string, data: UpdateReleaseDto) {
    return this.prisma.release.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.author && { author: data.author }),
        ...(data.changelogGlobal && { changelogGlobal: Buffer.from(data.changelogGlobal, 'utf-8') }),
        ...(data.moduleReleases && {
          moduleReleases: {
            deleteMany: {},
            create: data.moduleReleases.map(mr => ({
              module: { connect: { id: mr.moduleId } },
              tag: { connect: { id: mr.tagId } },
            }))
          }
        })
      },
      include: { moduleReleases: true }
    });
  }

  remove(id: string) {
    return this.prisma.release.delete({
      where: { id },
    });
  }

  async removeAll() {
    return this.prisma.release.deleteMany({});
  }
}
