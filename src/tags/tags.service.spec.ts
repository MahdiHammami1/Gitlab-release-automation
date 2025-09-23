import { Test, TestingModule } from '@nestjs/testing';
import { TagsService } from './tags.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { HttpException } from '@nestjs/common';

describe('TagsService', () => {
  let service: TagsService;
  let prisma: PrismaService;
  let httpService: HttpService;

  beforeEach(async () => {
    const prismaMock = {
      tag: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    const httpServiceMock = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagsService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: HttpService, useValue: httpServiceMock },
      ],
    }).compile();

    service = module.get<TagsService>(TagsService);
    prisma = module.get<PrismaService>(PrismaService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a tag', async () => {
    const dto = { name: 'tag1', link: 'https://repo.url', commitHash: 'abc123', author: 'author1' };
    prisma.tag.create = jest.fn().mockResolvedValue({ id: '1', ...dto });
    await expect(service.create(dto)).resolves.toEqual({ id: '1', ...dto });
    expect(prisma.tag.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should throw error if name is missing when creating a tag', async () => {
    const dto = { link: 'https://repo.url', commitHash: 'abc123', author: 'author1' };
    await expect(service.create(dto as any)).rejects.toThrow(HttpException);
    await expect(service.create(dto as any)).rejects.toThrow('Le champ name est obligatoire pour créer un tag.');
  });

  it('should find all tags', async () => {
    prisma.tag.findMany = jest.fn().mockResolvedValue([{ id: '1', name: 'tag1' }]);
    await expect(service.findAll()).resolves.toEqual([{ id: '1', name: 'tag1' }]);
    expect(prisma.tag.findMany).toHaveBeenCalled();
  });

  it('should find one tag', async () => {
    prisma.tag.findUnique = jest.fn().mockResolvedValue({ id: '1', name: 'tag1' });
    await expect(service.findOne('1')).resolves.toEqual({ id: '1', name: 'tag1' });
    expect(prisma.tag.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should update a tag', async () => {
    const dto = { name: 'updated' };
    prisma.tag.update = jest.fn().mockResolvedValue({ id: '1', ...dto });
    await expect(service.update('1', dto as any)).resolves.toEqual({ id: '1', ...dto });
    expect(prisma.tag.update).toHaveBeenCalledWith({ where: { id: '1' }, data: dto });
  });

  it('should remove a tag', async () => {
    prisma.tag.delete = jest.fn().mockResolvedValue({ id: '1', name: 'tag1' });
    await expect(service.remove('1')).resolves.toEqual({ id: '1', name: 'tag1' });
    expect(prisma.tag.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should handle prisma error on create', async () => {
    const dto = { name: 'fail', link: 'https://repo.url', commitHash: 'abc123', author: 'author1' };
    prisma.tag.create = jest.fn().mockRejectedValue(new Error('Prisma error'));
    await expect(service.create(dto)).rejects.toThrow(HttpException);
    await expect(service.create(dto)).rejects.toThrow('Failed to create tag');
  });

  it('should handle prisma error on update', async () => {
    const dto = { name: 'fail', link: 'https://repo.url', commitHash: 'abc123', author: 'author1' };
    prisma.tag.update = jest.fn().mockRejectedValue(new Error('Prisma error'));
    await expect(service.update('1', dto)).rejects.toThrow(HttpException);
    await expect(service.update('1', dto)).rejects.toThrow('Failed to update tag');
  });

  it('should handle prisma error on remove', async () => {
    prisma.tag.delete = jest.fn().mockRejectedValue(new Error('Prisma error'));
    await expect(service.remove('1')).rejects.toThrow(HttpException);
    await expect(service.remove('1')).rejects.toThrow('Failed to delete tag');
  });

  it('should handle prisma error on findAll', async () => {
    prisma.tag.findMany = jest.fn().mockRejectedValue(new Error('Prisma error'));
    await expect(service.findAll()).rejects.toThrow(HttpException);
    await expect(service.findAll()).rejects.toThrow('Failed to retrieve tags');
  });

  it('should handle prisma error on findOne', async () => {
    prisma.tag.findUnique = jest.fn().mockRejectedValue(new Error('Prisma error'));
    await expect(service.findOne('fail')).rejects.toThrow(HttpException);
    await expect(service.findOne('fail')).rejects.toThrow('Failed to retrieve tags');
  });

  it('should return null if findOne not found', async () => {
    prisma.tag.findUnique = jest.fn().mockResolvedValue(null);
    await expect(service.findOne('999')).resolves.toBeNull();
  });

  it('should return null if update not found', async () => {
    const dto = { name: 'notfound' };
    prisma.tag.update = jest.fn().mockResolvedValue(null);
    await expect(service.update('999', dto as any)).resolves.toBeNull();
  });

  it('should return null if remove not found', async () => {
    prisma.tag.delete = jest.fn().mockResolvedValue(null);
    await expect(service.remove('999')).resolves.toBeNull();
  });

  it('should propagate unknown errors', async () => {
    prisma.tag.findMany = jest.fn().mockImplementation(() => { throw new Error('Unknown'); });
    await expect(service.findAll()).rejects.toThrow(HttpException);
    await expect(service.findAll()).rejects.toThrow('Failed to retrieve tags');
  });

  it('should throw error for invalid GitLab URL in createFromGitlab', async () => {
    await expect(service.createFromGitlab('https://notgitlab.com/repo.git', 'v1.0.0')).rejects.toThrow('URL GitLab invalide');
  });

  it('should throw HttpException if DB fails on findAll', async () => {
    prisma.tag.findMany = jest.fn().mockImplementation(() => {
      throw new Error('DB error');
    });

    await expect(service.findAll()).rejects.toThrow(HttpException);
    await expect(service.findAll()).rejects.toThrow('Failed to retrieve tags');
  });
});
