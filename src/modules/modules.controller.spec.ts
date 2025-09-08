import { Test, TestingModule } from '@nestjs/testing';
import { ModulesController } from './modules.controller';
import { ModulesService } from './modules.service';

describe('ModulesController', () => {
  let controller: ModulesController;
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
      controllers: [ModulesController],
      providers: [
        { provide: ModulesService, useValue: serviceMock },
      ],
    }).compile();

    controller = module.get<ModulesController>(ModulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Ajouter ici des tests pour chaque endpoint du contrôleur
});
