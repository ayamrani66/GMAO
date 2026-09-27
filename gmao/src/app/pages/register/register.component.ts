import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit, OnDestroy {

  user = { mail: '', nomComplet: '', password: '', telephone: '' };
  passwordStrength: 'weak' | 'medium' | 'strong' | '' = '';
  passwordStrengthScore = 0;
  showPassword = false;
  passwordCriteria = { length: false, number: false, special: false, uppercase: false };
  mailChecking = false; mailTaken = false; mailValid = false;
  loading = false; successMessage = ''; errorMessage = '';

  private mailSubject = new Subject<string>();
  private mailSub!: Subscription;
  private animClass = 'anim-in-right'; // register = arrivée depuis la droite par défaut

  constructor(private authService: AuthService, private router: Router) {
    const nav = this.router.getCurrentNavigation();
    const dir = nav?.extras?.state?.['direction'];
    if (dir === 'from-login') this.animClass = 'anim-in-right';
  }

  ngOnInit(): void {
    // Animation d'entrée
    requestAnimationFrame(() => {
      const el = document.querySelector('.form-inner') as HTMLElement;
      if (!el) return;
      el.classList.remove('anim-in-left', 'anim-in-right');
      void el.offsetWidth;
      el.classList.add(this.animClass);
      setTimeout(() => el.classList.remove(this.animClass), 600);
    });

    // Vérification email
    this.mailSub = this.mailSubject.pipe(
      debounceTime(500), distinctUntilChanged(),
      switchMap(mail => {
        if (!this.isValidEmail(mail)) {
          this.mailChecking = false; this.mailTaken = false; this.mailValid = false;
          return [];
        }
        this.mailChecking = true;
        return this.authService.checkMailExists(mail);
      })
    ).subscribe({
      next: (exists: boolean) => { this.mailChecking = false; this.mailTaken = exists; this.mailValid = !exists; },
      error: () => { this.mailChecking = false; }
    });
  }

  ngOnDestroy(): void { this.mailSub?.unsubscribe(); }

  onMailChange(v: string): void { this.mailValid = false; this.mailTaken = false; this.mailSubject.next(v); }

  onPasswordChange(v: string): void {
    this.passwordCriteria.length    = v.length >= 8;
    this.passwordCriteria.number    = /\d/.test(v);
    this.passwordCriteria.special   = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v);
    this.passwordCriteria.uppercase = /[A-Z]/.test(v);
    const s = Object.values(this.passwordCriteria).filter(Boolean).length;
    this.passwordStrengthScore = s;
    this.passwordStrength = s <= 1 ? 'weak' : s <= 3 ? 'medium' : 'strong';
  }

  get isPasswordValid() { return Object.values(this.passwordCriteria).every(Boolean); }
  isValidEmail(m: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m); }
  togglePassword(): void { this.showPassword = !this.showPassword; }

  // Animation de sortie PUIS navigation
  goToLogin(): void {
    const el = document.querySelector('.form-inner') as HTMLElement;
    if (!el) { this.router.navigate(['/login'], { state: { direction: 'from-register' } }); return; }

    el.style.cssText = 'animation: slideOutToRight 0.24s ease-in both';
    setTimeout(() => {
      el.style.cssText = '';
      this.router.navigate(['/login'], { state: { direction: 'from-register' } });
    }, 220);
  }

  get canSubmit() {
  return !!(
    this.user.nomComplet && 
    this.user.mail && 
    this.mailValid && // Doit être true
    !this.mailTaken && // Doit être false
    this.user.password && 
    this.isPasswordValid && // Tous les critères de force doivent être au vert
    !this.loading
  );
}

  register(): void {
    if (!this.canSubmit) return;
    this.loading = true; this.errorMessage = ''; this.successMessage = '';
    this.authService.register(this.user).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Compte créé ! Un administrateur vous assignera un rôle.';
        setTimeout(() => this.router.navigate(['/login'], { state: { direction: 'from-register' } }), 2500);
      },
      error: (err) => { this.loading = false; this.errorMessage = err?.error?.message || 'Une erreur est survenue.'; }
    });
  }
}