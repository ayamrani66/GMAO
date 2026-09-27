import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipementFormComponent } from './equipement-form.component';

describe('EquipementFormComponent', () => {
  let component: EquipementFormComponent;
  let fixture: ComponentFixture<EquipementFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipementFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipementFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
