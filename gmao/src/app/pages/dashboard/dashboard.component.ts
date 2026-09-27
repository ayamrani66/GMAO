import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { NgxEchartsModule, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { BarChart, PieChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import { DashboardService, DashboardStats } from '../../services/dashboard.service';

echarts.use([BarChart, PieChart, GridComponent, TooltipComponent, CanvasRenderer]);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule],
  providers: [
    provideEchartsCore({ echarts })
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {

  stats: DashboardStats | null = null;
  loading = true;
  error = false;
  today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });


  chartRepartition: any = null;
  chartCoutZone: any = null;
  chartEvolution: any = null;

  private pollSub?: Subscription;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  startPolling(): void {
    this.pollSub?.unsubscribe();
    this.loading = true;

    this.pollSub = interval(5 * 60 * 1000).pipe(
      startWith(0),
      switchMap(() => this.dashboardService.getStats())
    ).subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
        this.error = false;
        this.buildCharts(data);
      },
      error: () => {
        this.loading = false;
        this.error = true;
      }
    });
  }

  buildCharts(s: DashboardStats): void {

    // ── Répartition correctif / préventif ─────────────────────────────────
    this.chartRepartition = {
      tooltip: {
        trigger: 'item',
        formatter: (p: any) => `${p.name}<br/><b>${p.value}</b> OT (${p.percent}%)`
      },
      series: [{
        type: 'pie',
        radius: ['55%', '80%'],
        center: ['50%', '50%'],
        data: [
          { value: s.totalCorrectif, name: 'Correctif', itemStyle: { color: '#ffa770' } },
          { value: s.totalPreventif, name: 'Préventif', itemStyle: { color: '#378ADD' } }
        ],
        label: { show: false },
        emphasis: { scale: true, scaleSize: 5 }
      }]
    };

    // ── Coût par zone (top 10, horizontal bar) ────────────────────────────
    const labels = s.equipementLabels.slice(0, 10);
    const couts  = s.coutParEquipement.slice(0, 10);
    this.chartCoutZone = {
      grid: { top: 8, bottom: 24, left: 90, right: 16 },
      xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: 'rgba(0,0,0,0.05)' } },
        axisLabel: {
          fontSize: 10, color: '#95969e',
          formatter: (v: number) => v >= 1000 ? Math.round(v / 1000) + 'k' : String(v)
        },
        axisLine: { show: false }, axisTick: { show: false }
      },
      yAxis: {
        type: 'category',
        data: labels,
        axisLabel: { fontSize: 10, color: '#3a3b42', width: 80, overflow: 'truncate' },
        axisLine: { show: false }, axisTick: { show: false }
      },
      tooltip: {
        trigger: 'axis',
        formatter: (p: any[]) => `${p[0].name}<br/>Coût : <b>${p[0].value.toLocaleString('fr-FR')} MAD</b>`
      },
      series: [{
        type: 'bar',
        data: couts,
        itemStyle: { color: '#ffa770', borderRadius: [0, 4, 4, 0] },
        barMaxWidth: 28,
        emphasis: { itemStyle: { color: '#e8884a' } }
      }]
    };
  }

  statutClass(s: string): string {
    return s === 'RUPTURE' ? 'badge-rupture' : 'badge-critique';
  }

  retardClass(j: number): string {
    if (j >= 10) return 'retard-high';
    if (j >= 5)  return 'retard-med';
    return 'retard-low';
  }

  formatStock(v: number): string {
    return v >= 1000 ? Math.round(v / 1000) + ' k MAD' : v + ' MAD';
  }
}