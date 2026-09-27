import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipementTreeComponent } from './equipement-tree.component';

describe('EquipementTreeComponent', () => {
  let component: EquipementTreeComponent;
  let fixture: ComponentFixture<EquipementTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipementTreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipementTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
