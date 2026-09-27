import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css']
})
export class TopbarComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  currentUserId: number | null = null;
  isResponsable = false;
  
  showNotifications = false;
  notifications: any[] = [];
  unreadCount = 0;
  private intervalId: any;

  constructor(
    private router: Router,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.currentUserId = this.currentUser?.id ?? null;

    // Vérification du rôle
    if (this.currentUser && this.currentUser.role) {
      const role = this.currentUser.role.toUpperCase();
      this.isResponsable = role === 'RESPONSABLE' || role === 'ADMIN';
    }

    if (this.currentUserId) {
      this.loadNotifications();
      // Polling des notifications toutes les 30 secondes
      this.intervalId = setInterval(() => this.loadNotifications(), 30000);
    }

    // Synchronisation du compteur
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  loadNotifications(): void {
    if (!this.currentUserId) return;
    this.notificationService.getAll(this.currentUserId).subscribe({
      next: (data) => {
        this.notifications = data;
        const count = data.filter((n: any) => !n.lu).length;
        this.notificationService.unreadCount$.next(count);
      },
      error: (err) => console.error('Erreur notifications :', err)
    });
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToNotifications(): void {
    this.showNotifications = false;
    this.router.navigate(['/notifications']);
  }
}