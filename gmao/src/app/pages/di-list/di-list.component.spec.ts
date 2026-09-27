import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiListComponent } from './di-list.component';

describe('DiListComponent', () => {
  let component: DiListComponent;
  let fixture: ComponentFixture<DiListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DiListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
