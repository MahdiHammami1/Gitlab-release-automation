import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const prismaMock = {
      user: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user', async () => {
    const dto = { email: 'john@example.com', username: 'john', gitlabId: '123', accessToken: 'token', refreshToken: undefined };
    prisma.user.create = jest.fn().mockResolvedValue({ id: '1', ...dto });
    await expect(service.create(dto)).resolves.toEqual({ id: '1', ...dto });
    expect(prisma.user.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should find all users', async () => {
    prisma.user.findMany = jest.fn().mockResolvedValue([{ id: '1', email: 'john@example.com', username: 'john', gitlabId: '123', accessToken: 'token', refreshToken: undefined }]);
    await expect(service.findAll()).resolves.toEqual([{ id: '1', email: 'john@example.com', username: 'john', gitlabId: '123', accessToken: 'token', refreshToken: undefined }]);
    expect(prisma.user.findMany).toHaveBeenCalled();
  });

  it('should find one user', async () => {
    prisma.user.findUnique = jest.fn().mockResolvedValue({ id: '1', email: 'john@example.com', username: 'john', gitlabId: '123', accessToken: 'token', refreshToken: undefined });
    await expect(service.findOne('1')).resolves.toEqual({ id: '1', email: 'john@example.com', username: 'john', gitlabId: '123', accessToken: 'token', refreshToken: undefined });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should update a user', async () => {
    const dto = { username: 'updated', email: 'john@example.com', gitlabId: '123', accessToken: 'token', refreshToken: undefined };
    prisma.user.update = jest.fn().mockResolvedValue({ id: '1', ...dto });
    await expect(service.update('1', dto)).resolves.toEqual({ id: '1', ...dto });
    expect(prisma.user.update).toHaveBeenCalledWith({ where: { id: '1' }, data: dto });
  });

  it('should remove a user', async () => {
    prisma.user.delete = jest.fn().mockResolvedValue(undefined);
    await expect(service.remove('1')).resolves.toBeUndefined();
    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: '1' } });
  });

  it('should find user by email', async () => {
    prisma.user.findUnique = jest.fn().mockResolvedValue({ id: '1', email: 'john@example.com' });
    await expect(service.findByEmail('john@example.com')).resolves.toEqual({ id: '1', email: 'john@example.com' });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'john@example.com' } });
  });

  it('should handle error on findAll', async () => {
    jest.spyOn(prisma.user, 'findMany').mockRejectedValue(new Error('Database error'));

    await expect(service.findAll()).rejects.toThrow(HttpException);
    await expect(service.findAll()).rejects.toThrow('Failed to retrieve users');
  });

  it('should throw HttpException if DB fails', async () => {
    prisma.user.findMany = jest.fn().mockRejectedValue(new Error('DB error'));
    await expect(service.findAll()).rejects.toThrow(HttpException);
    await expect(service.findAll()).rejects.toThrow('Failed to retrieve users');
  });

  it('should handle prisma error on create', async () => {
    const dto = { email: 'fail@example.com', username: 'fail', gitlabId: '999', accessToken: 'fail', refreshToken: undefined };
    prisma.user.create = jest.fn().mockRejectedValue(new Error('Prisma error'));
    await expect(service.create(dto)).rejects.toThrow('Prisma error');
  });

  it('should handle prisma error on update', async () => {
    const dto = { username: 'fail', email: 'fail@example.com', gitlabId: '999', accessToken: 'fail', refreshToken: undefined };
    prisma.user.update = jest.fn().mockRejectedValue(new Error('Prisma error'));
    await expect(service.update('1', dto)).rejects.toThrow('Prisma error');
  });

  it('should throw HttpException if create fails', async () => {
    prisma.user.create = jest.fn().mockRejectedValue(new Error('Database error'));

    await expect(service.create({ email: 'test@example.com', username: 'test' })).rejects.toThrow(HttpException);
    await expect(service.create({ email: 'test@example.com', username: 'test' })).rejects.toThrow('Failed to create user');
  });

  it('should throw HttpException if findAll fails', async () => {
    prisma.user.findMany = jest.fn().mockRejectedValue(new Error('Database error'));

