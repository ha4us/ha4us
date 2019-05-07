import { ScriptsModule } from './scripts.module'

describe('ScriptsModule', () => {
  let scriptsModule: ScriptsModule

  beforeEach(() => {
    scriptsModule = new ScriptsModule()
  })

  it('should create an instance', () => {
    expect(scriptsModule).toBeTruthy()
  })
})
