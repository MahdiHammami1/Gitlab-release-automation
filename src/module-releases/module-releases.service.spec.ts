import { Test, TestingModule } from '@nestjs/testing';
import { ModuleReleasesService } from './module-releases.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ModuleReleasesService', () => {
  let service: ModuleReleasesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const prismaMock = {
      moduleRelease: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuleReleasesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<ModuleReleasesService>(ModuleReleasesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Ajouter ici des tests pour chaque méthode publique du service
});
