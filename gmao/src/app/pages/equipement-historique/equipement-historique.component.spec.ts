import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipementHistoriqueComponent } from './equipement-historique.component';

describe('EquipementHistoriqueComponent', () => {
  let component: EquipementHistoriqueComponent;
  let fixture: ComponentFixture<EquipementHistoriqueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipementHistoriqueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipementHistoriqueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
