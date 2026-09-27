import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CauseArchivageDialogComponentComponent } from './cause-archivage-dialog-component.component';

describe('CauseArchivageDialogComponentComponent', () => {
  let component: CauseArchivageDialogComponentComponent;
  let fixture: ComponentFixture<CauseArchivageDialogComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CauseArchivageDialogComponentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CauseArchivageDialogComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
