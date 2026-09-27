import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtPreventifDetailComponent } from './ot-preventif-detail.component';

describe('OtPreventifDetailComponent', () => {
  let component: OtPreventifDetailComponent;
  let fixture: ComponentFixture<OtPreventifDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtPreventifDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtPreventifDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
