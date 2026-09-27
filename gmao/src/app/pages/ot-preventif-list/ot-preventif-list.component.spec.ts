import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtPreventifListComponent } from './ot-preventif-list.component';

describe('OtPreventifListComponent', () => {
  let component: OtPreventifListComponent;
  let fixture: ComponentFixture<OtPreventifListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtPreventifListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtPreventifListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
