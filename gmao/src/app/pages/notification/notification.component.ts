import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

type FilterType = 'toutes' | 'nonLues' | 'lues';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationsComponent implements OnInit {

  notifications: any[] = [];
  unreadCount = 0;
  loading = false;
  currentUserId: number | null = null;
  activeFilter: FilterType = 'toutes';

  filterOptions: { label: string; value: FilterType }[] = [
    { label: 'Toutes', value: 'toutes' },
    { label: 'Non lues', value: 'nonLues' },
    { label: 'Lues', value: 'lues' },
  ];

  get filteredNotifications(): any[] {
    switch (this.activeFilter) {
      case 'nonLues': return this.notifications.filter(n => !n.lu);
      case 'lues':    return this.notifications.filter(n => n.lu);
      default:        return this.notifications;
    }
  }

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
  private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.currentUserId = user?.id ?? null;

    if (this.currentUserId !== null && this.currentUserId > 0) {
      this.loadNotifications();
    } else {
      console.error('ID utilisateur invalide:', this.currentUserId);
    }
  }

  loadNotifications(): void {
  if (!this.currentUserId) return;
  this.loading = true;
  this.notificationService.getAll(this.currentUserId).subscribe({
    next: (data) => {
      this.notifications = data;
      this.unreadCount = data.filter((n: any) => !n.lu).length;
      this.loading = false;
    },
    error: (err) => {
      console.error('Erreur chargement notifications :', err);
      this.loading = false;
    }
  });
}

  setFilter(filter: FilterType): void {
    this.activeFilter = filter;
  }

  marquerToutesLues(): void {
    if (!this.currentUserId) return;
    this.notificationService.markAllAsRead(this.currentUserId).subscribe(() => {
      this.notifications.forEach(n => n.lu = true);
      this.unreadCount = 0;
    });
  }
  naviguerVersOT(ot: any): void {
  if (!ot?.id) return;
  if (ot.codeOT?.startsWith('OTP')) {
    this.router.navigate(['/ot-preventif/details', ot.id]);
  } else {
    this.router.navigate(['/ot-correctif/details', ot.id]);
  }
}
naviguerDepuisMessage(n: any): void {
  const msg: string = n.message ?? '';

  if (n.ordreTravail?.id) {
    this.naviguerVersOT(n.ordreTravail);
    return;
  }
  if (n.demandeIntervention?.id) {
    this.router.navigate(['/di/details', n.demandeIntervention.id]);
    return;
  }
  if (msg.includes('Nouvelle inscription')) {
    this.router.navigate(['/users']);
    return;
  }
}

getLienLabel(n: any): string | null {
  const msg: string = n.message ?? '';
  if (n.ordreTravail?.codeOT)         return `🔗 OT : ${n.ordreTravail.codeOT}`;
  if (n.demandeIntervention?.codeDI)  return `📋 DI : ${n.demandeIntervention.codeDI}`;
  if (msg.includes('Nouvelle inscription')) return '👥 Voir les utilisateurs';
  return null;
}
}