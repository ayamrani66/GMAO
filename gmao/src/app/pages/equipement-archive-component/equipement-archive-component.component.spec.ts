import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipementArchiveComponentComponent } from './equipement-archive-component.component';

describe('EquipementArchiveComponentComponent', () => {
  let component: EquipementArchiveComponentComponent;
  let fixture: ComponentFixture<EquipementArchiveComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipementArchiveComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipementArchiveComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
