import { VisorModule } from './visor.module';

describe('VisorModule', () => {
  let visorModule: VisorModule;

  beforeEach(() => {
    visorModule = new VisorModule();
  });

  it('should create an instance', () => {
    expect(visorModule).toBeTruthy();
  });
});
