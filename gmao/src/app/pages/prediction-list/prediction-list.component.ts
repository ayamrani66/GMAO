// predictions-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { PredictionService, NotificationPrediction } from '../../services/prediction.service';

@Component({
  selector: 'app-predictions-list',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './prediction-list.component.html',
  styleUrls: ['./prediction-list.component.css']
})
export class PredictionsListComponent implements OnInit, OnDestroy {

  notifications: NotificationPrediction[] = [];
  filtered: NotificationPrediction[] = [];
  filtreActif: 'toutes' | 'nonlues' | 'critique' = 'toutes';
  countNonLues = 0;
  loading = true;

  private pollSub?: Subscription;

  constructor(private svc: PredictionService) {}

  ngOnInit() {
    // Polling toutes les 60 secondes
    this.pollSub = interval(60_000).pipe(
      startWith(0),
      switchMap(() => this.svc.getAll())
    ).subscribe({
      next: (data) => {
        this.notifications = data;
        this.countNonLues  = data.filter(n => !n.lue).length;
        this.applyFiltre();
        this.loading = false;
      }
    });
  }

  ngOnDestroy() { this.pollSub?.unsubscribe(); }

  setFiltre(f: 'toutes' | 'nonlues' | 'critique') {
    this.filtreActif = f;
    this.applyFiltre();
  }

  applyFiltre() {
    switch (this.filtreActif) {
      case 'nonlues':  this.filtered = this.notifications.filter(n => !n.lue); break;
      case 'critique': this.filtered = this.notifications.filter(n => n.niveauRisque === 'CRITIQUE'); break;
      default:         this.filtered = this.notifications;
    }
  }

  marquerLue(n: NotificationPrediction) {
    this.svc.marquerLue(n.id).subscribe(() => {
      n.lue = true;
      this.countNonLues = Math.max(0, this.countNonLues - 1);
      this.applyFiltre();
    });
  }

  lireTout() {
    this.svc.lireTout().subscribe(() => {
      this.notifications.forEach(n => n.lue = true);
      this.countNonLues = 0;
      this.applyFiltre();
    });
  }

  supprimer(n: NotificationPrediction) {
    this.svc.supprimer(n.id).subscribe(() => {
      this.notifications = this.notifications.filter(x => x.id !== n.id);
      if (!n.lue) this.countNonLues = Math.max(0, this.countNonLues - 1);
      this.applyFiltre();
    });
  }

  countParNiveau(niveau: string) {
    return this.notifications.filter(n => n.niveauRisque === niveau).length;
  }

  emoji(n: string) { return {'CRITIQUE':'🔴','MODÉRÉ':'🟡','FAIBLE':'🟢'}[n] ?? '⚪'; }
  cssNiveau(n: string) { return n.toLowerCase().replace('é','e'); }
  trackById(_: number, n: NotificationPrediction) { return n.id; }
}