import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiDetailsComponent } from './di-details.component';

describe('DiDetailsComponent', () => {
  let component: DiDetailsComponent;
  let fixture: ComponentFixture<DiDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
