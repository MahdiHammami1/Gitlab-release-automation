import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { ModulesService } from './modules.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ModulesService', () => {
  let service: ModulesService;
  let prisma: PrismaService;
  let httpService: HttpService;

  beforeEach(async () => {
    const prismaMock = {
      module: {
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
        ModulesService,
        { provide: PrismaService, useValue: prismaMock },
        { provide: HttpService, useValue: httpServiceMock },
      ],
    }).compile();

    service = module.get<ModulesService>(ModulesService);
    prisma = module.get<PrismaService>(PrismaService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Ajouter ici des tests pour chaque méthode publique du service
});
