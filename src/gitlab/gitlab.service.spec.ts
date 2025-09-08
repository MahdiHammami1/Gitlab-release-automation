import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { GitlabService } from './gitlab.service';

describe('GitlabService', () => {
  let service: GitlabService;
  let httpService: HttpService;

  beforeAll(() => {
    process.env.GITLAB_PAT = 'dummy_token';
  });

  beforeEach(async () => {
    const httpServiceMock = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GitlabService,
        { provide: HttpService, useValue: httpServiceMock },
      ],
    }).compile();

    service = module.get<GitlabService>(GitlabService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Ajouter ici des tests pour chaque méthode publique du service
});
