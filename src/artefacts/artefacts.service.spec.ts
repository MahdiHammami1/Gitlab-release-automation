import { Test, TestingModule } from '@nestjs/testing';
import { ArtefactsService } from './artefacts.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArtefactDto } from './dto/create-artefact.dto';
import { UpdateArtefactDto } from './dto/update-artefact.dto';
import { HttpException } from '@nestjs/common';

describe('ArtefactsService', () => {
  let service: ArtefactsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const prismaMock = {
      artefact: {
        create: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue(null),
        update: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtefactsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ArtefactsService>(ArtefactsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an artefact', async () => {
    const dto: CreateArtefactDto = { name: 'test' } as any;
    prisma.artefact.create = jest.fn().mockResolvedValue({ id: '1', ...dto });
    await expect(service.create(dto)).resolves.toEqual({ id: '1', ...dto });
    expect(prisma.artefact.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should find all artefacts', async () => {
    prisma.artefact.findMany = jest.fn().mockResolvedValue([{ id: '1', name: 'test' }]);
    await expect(service.findAll()).resolves.toEqual([{ id: '1', name: 'test' }]);
    expect(prisma.artefact.findMany).toHaveBeenCalled();
  });

  it('should find one artefact', async () => {
    prisma.artefact.findUnique = jest.fn().mockResolvedValue({ id: '1', name: 'test' });
    await expect(service.findOne('1')).resolves.toEqual({ id: '1', name: 'test' });
    expect(prisma.artefact.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should return null if artefact not found', async () => {
    prisma.artefact.findUnique = jest.fn().mockResolvedValue(null);
    await expect(service.findOne('999')).resolves.toBeNull();
    expect(prisma.artefact.findUnique).toHaveBeenCalledWith({ where: { id: '999' } });
  });

  it('should update an artefact', async () => {
    const dto: UpdateArtefactDto = { name: 'updated' } as any;
    prisma.artefact.update = jest.fn().mockResolvedValue({ id: '1', ...dto });
    await expect(service.update('1', dto)).resolves.toEqual({ id: '1', ...dto });
    expect(prisma.artefact.update).toHaveBeenCalledWith({ where: { id: '1' }, data: dto });
  });

  it('should handle error on update', async () => {
    const dto: UpdateArtefactDto = { name: 'updated' } as any;
    prisma.artefact.update = jest.fn().mockRejectedValue(new Error('Not found'));
    await expect(service.update('999', dto)).rejects.toThrow(HttpException);
    await expect(service.update('999', dto)).rejects.toThrow('Failed to update artefact');
  });

  it('should remove an artefact', async () => {
    prisma.artefact.delete = jest.fn().mockResolvedValue({ id: '1', name: 'test' });
    await expect(service.remove('1')).resolves.toEqual({ id: '1', name: 'test' });
    expect(prisma.artefact.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should handle error on remove', async () => {
    prisma.artefact.delete = jest.fn().mockRejectedValue(new Error('Not found'));
    await expect(service.remove('999')).rejects.toThrow(HttpException);
    await expect(service.remove('999')).rejects.toThrow('Failed to delete artefact');
  });

  it('should handle error on create', async () => {
    const dto: CreateArtefactDto = { name: 'fail' } as any;
    prisma.artefact.create = jest.fn().mockRejectedValue(new Error('DB error'));
    await expect(service.create(dto)).rejects.toThrow(HttpException);
    await expect(service.create(dto)).rejects.toThrow('Failed to create artefact');
  });

  it('should handle error on findAll', async () => {
    prisma.artefact.findMany = jest.fn().mockRejectedValue(new Error('DB error'));
    await expect(service.findAll()).rejects.toThrow(HttpException);
    await expect(service.findAll()).rejects.toThrow('Failed to retrieve artefacts');
  });

  it('should handle error on findOne', async () => {
    prisma.artefact.findUnique = jest.fn().mockRejectedValue(new Error('DB error'));
    await expect(service.findOne('fail')).rejects.toThrow(HttpException);
    await expect(service.findOne('fail')).rejects.toThrow('Failed to retrieve artefact');
  });

  it('should propagate unknown errors', async () => {
    prisma.artefact.findMany = jest.fn().mockImplementation(() => { throw new Error('Unknown'); });
    await expect(service.findAll()).rejects.toThrow(HttpException);
    await expect(service.findAll()).rejects.toThrow('Failed to retrieve artefacts');
  });

  it('should throw HttpException if DB fails on findAll', async () => {
    prisma.artefact.findMany = jest.fn().mockImplementation(() => {
      throw new Error('DB error');
    });

    await expect(service.findAll()).rejects.toThrow(HttpException);
    await expect(service.findAll()).rejects.toThrow('Failed to retrieve artefacts');
  });

  // Ajouter ici des tests pour chaque méthode publique du service
});
