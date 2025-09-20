import { PrismaModule } from './prisma.module';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { Module } from '@nestjs/common';

describe('PrismaModule', () => {
  it('should be defined', () => {
    expect(new PrismaModule()).toBeDefined();
  });

  it('should be instantiable without error', () => {
    expect(() => new PrismaModule()).not.toThrow();
  });

  it('should be an instance of PrismaModule', () => {
    const module = new PrismaModule();
    expect(module).toBeInstanceOf(PrismaModule);
  });

  it('should provide PrismaService via NestJS DI', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();
    const prismaService = moduleRef.get<PrismaService>(PrismaService);
    expect(prismaService).toBeDefined();
    expect(typeof prismaService.$connect).toBe('function');
    expect(typeof prismaService.$disconnect).toBe('function');
    expect('shutdownHookAdded' in prismaService).toBe(true);
  });

  it('should be importable in another module', async () => {
    @Module({ imports: [PrismaModule] })
    class DummyModule {}
    const moduleRef = await Test.createTestingModule({ imports: [DummyModule] }).compile();
    const prismaService = moduleRef.get<PrismaService>(PrismaService);
    expect(prismaService).toBeDefined();
    expect(typeof prismaService.$connect).toBe('function');
    expect(typeof prismaService.$disconnect).toBe('function');
    expect('shutdownHookAdded' in prismaService).toBe(true);
  });

  it('should call $connect on onModuleInit', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();
    const prismaService = moduleRef.get<PrismaService>(PrismaService);
    const connectSpy = jest.spyOn(prismaService, '$connect').mockResolvedValue(undefined);
    await prismaService.onModuleInit();
    expect(connectSpy).toHaveBeenCalled();
    connectSpy.mockRestore();
  });

  it('should add shutdown hook and call $disconnect and app.close', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();
    const prismaService = moduleRef.get<PrismaService>(PrismaService);
    const disconnectSpy = jest.spyOn(prismaService, '$disconnect').mockResolvedValue(undefined);
    const appMock = { close: jest.fn().mockResolvedValue(undefined) } as any;
    // Reset shutdownHookAdded for test isolation
    (prismaService as any).shutdownHookAdded = false;
    // Simule process.on
    const processOnSpy = jest.spyOn(process, 'on').mockImplementation((event, cb) => {
      if (event === 'beforeExit') {
        cb();
      }
      return process as any;
    });
    await prismaService.enableShutdownHooks(appMock);
    expect(disconnectSpy).toHaveBeenCalled();
    expect(appMock.close).toHaveBeenCalled();
    processOnSpy.mockRestore();
    disconnectSpy.mockRestore();
  });

  it('should always return the same PrismaService instance (singleton)', async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();
    const instance1 = moduleRef.get<PrismaService>(PrismaService);
    const instance2 = moduleRef.get<PrismaService>(PrismaService);
    expect(instance1).toBe(instance2);
  });
});
