import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  mail = '';
  password = '';
  showPassword = false;
  loading = false;
  errorMessage = '';
  mailOk = false;
  mailError = false;

  // Direction d'arrivée transmise via navigation state
  private animClass = 'anim-in-left'; // login = arrivée depuis la gauche par défaut

  constructor(private authService: AuthService, private router: Router) {
    // Récupère la direction depuis le state du router (envoyé par register)
    const nav = this.router.getCurrentNavigation();
    const dir = nav?.extras?.state?.['direction'];
    if (dir === 'from-register') this.animClass = 'anim-in-left';
  }

  ngOnInit(): void {
    // Lance l'animation d'entrée après que le DOM soit prêt
    requestAnimationFrame(() => {
      const el = document.querySelector('.form-inner') as HTMLElement;
      if (!el) return;
      el.classList.remove('anim-in-left', 'anim-in-right');
      // Force reflow pour rejouer l'animation même si la classe existait
      void el.offsetWidth;
      el.classList.add(this.animClass);
      // Nettoie la classe après la fin de l'animation (évite conflits)
      setTimeout(() => el.classList.remove(this.animClass), 600);
    });
  }

  isValidEmail(m: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(m); }

onMailChange(): void {
  this.errorMessage = '';
  this.mailError = false;
  this.mailOk = this.isValidEmail(this.mail);
}

onMailBlur(): void {
  if (!this.mail) return;
  this.mailError = !this.isValidEmail(this.mail);
}

  togglePassword(): void { this.showPassword = !this.showPassword; }

  // Animation de sortie PUIS navigation avec state
  goToRegister(): void {
    const el = document.querySelector('.form-inner') as HTMLElement;
    if (!el) { this.router.navigate(['/register'], { state: { direction: 'from-login' } }); return; }

    el.style.cssText = 'animation: slideOutToLeft 0.24s ease-in both';
    setTimeout(() => {
      el.style.cssText = '';
      this.router.navigate(['/register'], { state: { direction: 'from-login' } });
    }, 220);
  }

  get canSubmit() { return !!(this.mail && this.password && this.mailOk && !this.loading); }

  login(): void {
    if (!this.canSubmit) return;
    this.loading = true;
    this.errorMessage = '';
    this.authService.login({ mail: this.mail, password: this.password }).subscribe({
      next: ()    => { this.loading = false; this.router.navigate(['/modules']); },
      error: (err) => { this.loading = false; this.errorMessage = err?.error?.message || 'Email ou mot de passe incorrect.'; }
    });
  }
}