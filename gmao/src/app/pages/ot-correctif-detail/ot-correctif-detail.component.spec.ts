import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtCorrectifDetailComponent } from './ot-correctif-detail.component';

describe('OtCorrectifDetailComponent', () => {
  let component: OtCorrectifDetailComponent;
  let fixture: ComponentFixture<OtCorrectifDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtCorrectifDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtCorrectifDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
