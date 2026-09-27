import { TestBed } from '@angular/core/testing';

import { DiService } from './di.service';

describe('DiService', () => {
  let service: DiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
