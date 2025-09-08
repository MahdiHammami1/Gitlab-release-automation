import { Test, TestingModule } from '@nestjs/testing';
import { GitlabController } from './gitlab.controller';
import { GitlabService } from './gitlab.service';
import { HttpService } from '@nestjs/axios';

describe('GitlabController', () => {
  let controller: GitlabController;
  let serviceMock: any;

  beforeEach(async () => {
    serviceMock = {
      getProject: jest.fn(),
      getUser: jest.fn(),
      createProject: jest.fn(),
      // Ajoutez ici les autres méthodes du service à mocker si besoin
    };
    const httpServiceMock = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GitlabController],
      providers: [
        { provide: GitlabService, useValue: serviceMock },
        { provide: HttpService, useValue: httpServiceMock },
      ],
    }).compile();

    controller = module.get<GitlabController>(GitlabController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Ajouter ici des tests pour chaque endpoint du contrôleur
});
