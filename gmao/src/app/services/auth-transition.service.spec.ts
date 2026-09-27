import { TestBed } from '@angular/core/testing';

import { AuthTransitionService } from './auth-transition.service';

describe('AuthTransitionService', () => {
  let service: AuthTransitionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthTransitionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
