import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdrFormComponent } from './pdr-form.component';

describe('PdrFormComponent', () => {
  let component: PdrFormComponent;
  let fixture: ComponentFixture<PdrFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdrFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdrFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
