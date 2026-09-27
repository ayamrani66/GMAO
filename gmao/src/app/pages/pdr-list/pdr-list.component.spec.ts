import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdrListComponent } from './pdr-list.component';

describe('PdrListComponent', () => {
  let component: PdrListComponent;
  let fixture: ComponentFixture<PdrListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdrListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdrListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
