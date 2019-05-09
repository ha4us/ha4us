import { TestBed, inject } from '@angular/core/testing'

import { VisorService } from './visor.service'

describe('VisorService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [VisorService]
    })
  })

  it('should be created', inject([VisorService], (service: VisorService) => {
    expect(service).toBeTruthy()
  }))
})
