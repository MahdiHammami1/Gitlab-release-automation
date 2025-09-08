import { Test, TestingModule } from '@nestjs/testing';
import { ModuleReleasesController } from './module-releases.controller';
import { ModuleReleasesService } from './module-releases.service';

describe('ModuleReleasesController', () => {
  let controller: ModuleReleasesController;
  let serviceMock: any;

  beforeEach(async () => {
    serviceMock = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModuleReleasesController],
      providers: [
        { provide: ModuleReleasesService, useValue: serviceMock },
      ],
    }).compile();

    controller = module.get<ModuleReleasesController>(ModuleReleasesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Ajouter ici des tests pour chaque endpoint du contrôleur
});
