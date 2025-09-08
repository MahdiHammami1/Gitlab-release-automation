import { Test, TestingModule } from '@nestjs/testing';
import { ReleasesService } from './releases.service';
import { PrismaService } from '../prisma/prisma.service';

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

  // Ajouter ici des tests pour chaque méthode publique du service
});
