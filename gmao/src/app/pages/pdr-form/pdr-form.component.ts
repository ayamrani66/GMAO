import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, AsyncValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';
import { PieceRechangeService } from '../../services/piece-rechange.service';
import { PieceRechange, UNITES_OPTIONS } from '../../models/piece-rechange.model';

@Component({
  selector: 'app-pdr-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './pdr-form.component.html',
  styleUrls: ['./pdr-form.component.css']
})
export class PdrFormComponent implements OnInit {

  form!: FormGroup;
  isEditMode = false;
  pdrId: number | null = null;
  loading = false;
  submitting = false;
  errorMsg = '';

  readonly unites = UNITES_OPTIONS;

  constructor(
    private fb: FormBuilder,
    private pdrService: PieceRechangeService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.buildForm();
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'nouveau') {
      this.isEditMode = true;
      this.pdrId = +id;
      this.loadPdr(this.pdrId);
    }
  }

  buildForm(): void {
    this.form = this.fb.group({
      nom:          ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      code:         ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)],
                    [this.codeUniqueValidator()]],
      unite:        ['', Validators.required],
      description:  [''],
      prixUnitaire: [null, [Validators.min(0)]],
      stockMin:     [null, [Validators.min(0)]],
      stockMax:     [null, [Validators.min(0)]],
      stockActuel:  [null, [Validators.min(0)]]
    });
  }

  codeUniqueValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{[key: string]: any} | null> => {
      if (!control.value) return of(null);
      return timer(400).pipe(
        switchMap(() => this.pdrService.existsByCode(control.value)),
        map(res => (!this.isEditMode && res.exists) ? { codeExiste: true } : null),
        catchError(() => of(null))
      );
    };
  }

  loadPdr(id: number): void {
    this.loading = true;
    this.pdrService.getById(id).subscribe({
      next: pdr => { this.form.patchValue(pdr); this.loading = false; },
      error: () => { this.errorMsg = 'Impossible de charger la pièce de rechange.'; this.loading = false; }
    });
  }

  // Alerte stock bas
  get isStockBas(): boolean {
    const actuel = this.form.get('stockActuel')?.value;
    const min    = this.form.get('stockMin')?.value;
    return actuel != null && min != null && actuel < min;
  }

  onSubmit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting = true;
    const data: PieceRechange = this.form.value;
    const request = this.isEditMode && this.pdrId
      ? this.pdrService.update(this.pdrId, data)
      : this.pdrService.create(data);

    request.subscribe({
      next: () => this.router.navigate(['/pieces-rechange']),
      error: err => {
        this.errorMsg = err?.error?.message || 'Erreur lors de l\'enregistrement.';
        this.submitting = false;
      }
    });
  }

  get f() { return this.form.controls; }
  isInvalid(field: string) { return this.f[field].invalid && this.f[field].touched; }
}