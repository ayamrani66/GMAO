import { TestBed } from '@angular/core/testing';

import { OtService } from './ot.service';

describe('OtService', () => {
  let service: OtService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OtService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
