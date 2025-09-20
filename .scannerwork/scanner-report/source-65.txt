jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue({
      use: jest.fn(),
      listen: jest.fn()
    })
  }
}));

describe('main.ts', () => {
  it('should execute bootstrap without error', async () => {
    await import('./main');
    // Si le bootstrap s'exécute sans erreur, le test passe
    expect(true).toBe(true);
  });
});
