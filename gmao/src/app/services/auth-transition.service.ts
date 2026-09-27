import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthTransitionService {


  navigateWithTransition(
    direction: 'to-register' | 'to-login',
    navigateFn: () => void
  ): void {
    const card = document.querySelector('.auth-card') as HTMLElement;
    const inner = document.querySelector('.form-inner') as HTMLElement;
    if (!card) { navigateFn(); return; }

    // Classe de sortie
    const exitClass = direction === 'to-register' ? 'exit-to-left' : 'exit-to-right';
    card.classList.add(exitClass);

    setTimeout(() => {
      card.classList.remove(exitClass);
      navigateFn(); 
    }, 280); 
}
}