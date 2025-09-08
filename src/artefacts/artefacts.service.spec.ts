import { Test, TestingModule } from '@nestjs/testing';
import { ArtefactsService } from './artefacts.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArtefactDto } from './dto/create-artefact.dto';
import { UpdateArtefactDto } from './dto/update-artefact.dto';

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

  it('should update an artefact', async () => {
    const dto: UpdateArtefactDto = { name: 'updated' } as any;
    prisma.artefact.update = jest.fn().mockResolvedValue({ id: '1', ...dto });
    await expect(service.update('1', dto)).resolves.toEqual({ id: '1', ...dto });
    expect(prisma.artefact.update).toHaveBeenCalledWith({ where: { id: '1' }, data: dto });
  });

  it('should remove an artefact', async () => {
    prisma.artefact.delete = jest.fn().mockResolvedValue({ id: '1', name: 'deleted' });
    await expect(service.remove('1')).resolves.toEqual({ id: '1', name: 'deleted' });
    expect(prisma.artefact.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should handle not found artefact', async () => {
    prisma.artefact.findUnique = jest.fn().mockResolvedValue(null);
    await expect(service.findOne('999')).resolves.toBeNull();
  });

  // Ajouter ici des tests pour chaque méthode publique du service
});
