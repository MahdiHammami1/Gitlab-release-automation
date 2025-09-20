import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    // Nettoyer les listeners avant chaque test
    process.removeAllListeners('beforeExit');
    service = new PrismaService();
  });

  afterEach(() => {
    // Nettoyer les listeners après chaque test
    process.removeAllListeners('beforeExit');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call $connect on module init', async () => {
    service.$connect = jest.fn();
    await service.onModuleInit();
    expect(service.$connect).toHaveBeenCalled();
  });

  it('should call $disconnect and app.close on beforeExit', async () => {
    service.$disconnect = jest.fn();
    const app = { close: jest.fn() } as any;
    await service.enableShutdownHooks(app);
    // Simuler l'événement beforeExit
    const listeners = process.listeners('beforeExit');
    if (listeners.length > 0) {
      await listeners[0](0);
    }
    // Attendre la résolution des hooks
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(service.$disconnect).toHaveBeenCalled();
    expect(app.close).toHaveBeenCalled();
  });

  it('should not throw if enableShutdownHooks is called multiple times', async () => {
    service.$disconnect = jest.fn();
    const app = { close: jest.fn() } as any;
    await service.enableShutdownHooks(app);
    await service.enableShutdownHooks(app);
    const listeners2 = process.listeners('beforeExit');
    if (listeners2.length > 0) {
      await listeners2[0](0);
    }
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(service.$disconnect).toHaveBeenCalledTimes(1);
    expect(app.close).toHaveBeenCalledTimes(1);
  });
});
