import { Test, TestingModule } from '@nestjs/testing';
import { ReleasesService } from './releases.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpException } from '@nestjs/common';

describe('ReleasesService', () => {
  let service: ReleasesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const prismaMock = {
      release: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReleasesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ReleasesService>(ReleasesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a release with moduleReleases', async () => {
    const dto = {
      name: 'release1',
      author: 'author1',
      changelogGlobal: 'changelog',
      moduleReleases: [
        { moduleId: 'mod1', tagId: 'tag1' },
        { moduleId: 'mod2', tagId: 'tag2' }
      ]
    };
    prisma.release.create = jest.fn().mockResolvedValue({ id: '1', ...dto });
    await expect(service.create(dto)).resolves.toEqual({ id: '1', ...dto });
    expect(prisma.release.create).toHaveBeenCalled();
  });

  it('should create a release without moduleReleases', async () => {
    const dto = {
      name: 'release2',
      author: 'author2',
      changelogGlobal: 'changelog',
    };
    prisma.release.create = jest.fn().mockResolvedValue({ id: '2', ...dto });
    await expect(service.create(dto)).resolves.toEqual({ id: '2', ...dto });
    expect(prisma.release.create).toHaveBeenCalled();
  });

  it('should find all releases', async () => {
    prisma.release.findMany = jest.fn().mockResolvedValue([{ id: '1', name: 'release1' }]);
    await expect(service.findAll()).resolves.toEqual([{ id: '1', name: 'release1' }]);
    expect(prisma.release.findMany).toHaveBeenCalled();
  });

  it('should find one release', async () => {
    prisma.release.findUnique = jest.fn().mockResolvedValue({ id: '1', name: 'release1' });
    await expect(service.findOne('1')).resolves.toEqual({ id: '1', name: 'release1' });
    expect(prisma.release.findUnique).toHaveBeenCalledWith({ where: { id: '1' }, include: expect.any(Object) });
  });

  it('should update a release', async () => {
    const dto = { name: 'updated' };
    prisma.release.update = jest.fn().mockResolvedValue({ id: '1', ...dto });
    await expect(service.update('1', dto as any)).resolves.toEqual({ id: '1', ...dto });
    expect(prisma.release.update).toHaveBeenCalledWith({ where: { id: '1' }, data: dto, include: { moduleReleases: true } });
  });

  it('should remove a release', async () => {
    prisma.release.delete = jest.fn().mockResolvedValue({ id: '1', name: 'release1' });
    await expect(service.remove('1')).resolves.toEqual({ id: '1', name: 'release1' });
    expect(prisma.release.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should handle prisma error on create', async () => {
    const dto = { name: 'fail', author: 'author1', changelogGlobal: 'changelog' };
    prisma.release.create = jest.fn().mockRejectedValue(new Error('Prisma error'));
    await expect(service.create(dto as any)).rejects.toThrow('Prisma error');
  });

  it('should handle prisma error on update', async () => {
    const dto = { name: 'fail' };
    prisma.release.update = jest.fn().mockRejectedValue(new Error('Prisma error'));
    await expect(service.update('1', dto)).rejects.toThrow('Prisma error');
  });

  it('should handle prisma error on remove', async () => {
    prisma.release.delete = jest.fn().mockRejectedValue(new Error('Prisma error'));
    await expect(service.remove('1')).rejects.toThrow('Prisma error');
  });

  it('should handle prisma error on findAll', async () => {
    prisma.release.findMany = jest.fn().mockRejectedValue(new Error('Prisma error'));
    await expect(service.findAll()).rejects.toThrow(HttpException);
    await expect(service.findAll()).rejects.toThrow('Failed to retrieve releases');
  });

  it('should handle prisma error on findOne', async () => {
    prisma.release.findUnique = jest.fn().mockRejectedValue(new Error('Prisma error'));
    await expect(service.findOne('fail')).rejects.toThrow('Prisma error');
  });

  it('should return null if findOne not found', async () => {
    prisma.release.findUnique = jest.fn().mockResolvedValue(null);
    await expect(service.findOne('999')).resolves.toBeNull();
  });

  it('should return null if update not found', async () => {
    const dto = { name: 'notfound' };
    prisma.release.update = jest.fn().mockResolvedValue(null);
    await expect(service.update('999', dto as any)).resolves.toBeNull();
  });

  it('should return null if remove not found', async () => {
    prisma.release.delete = jest.fn().mockResolvedValue(null);
    await expect(service.remove('999')).resolves.toBeNull();
  });

  it('should propagate unknown errors', async () => {
    prisma.release.findMany = jest.fn().mockImplementation(() => { throw new Error('Unknown'); });
    await expect(service.findAll()).rejects.toThrow(HttpException);
    await expect(service.findAll()).rejects.toThrow('Failed to retrieve releases');
  });
});
