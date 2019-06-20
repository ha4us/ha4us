import { TestBed } from '@angular/core/testing';

import { NgUtilService } from './ng-util.service';

describe('NgUtilService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgUtilService = TestBed.get(NgUtilService);
    expect(service).toBeTruthy();
  });
});
