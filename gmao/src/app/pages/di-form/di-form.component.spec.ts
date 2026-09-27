import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiFormComponent } from './di-form.component';

describe('DiFormComponent', () => {
  let component: DiFormComponent;
  let fixture: ComponentFixture<DiFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
