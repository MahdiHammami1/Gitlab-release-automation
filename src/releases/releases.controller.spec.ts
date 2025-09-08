import { Test, TestingModule } from '@nestjs/testing';
import { ReleasesController } from './releases.controller';
import { ReleasesService } from './releases.service';

describe('ReleasesController', () => {
  let controller: ReleasesController;
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
      controllers: [ReleasesController],
      providers: [
        { provide: ReleasesService, useValue: serviceMock },
      ],
    }).compile();

    controller = module.get<ReleasesController>(ReleasesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Ajouter ici des tests pour chaque endpoint du contrôleur
});
