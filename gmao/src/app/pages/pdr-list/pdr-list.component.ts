import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PieceRechangeService } from '../../services/piece-rechange.service';
import { PieceRechange, UNITES_OPTIONS } from '../../models/piece-rechange.model';

@Component({
  selector: 'app-pdr-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pdr-list.component.html',
  styleUrls: ['./pdr-list.component.css']
})
export class PdrListComponent implements OnInit {

  pdrList: PieceRechange[] = [];
  filtered: PieceRechange[] = [];
  searchTerm = '';
  filterStock: 'all' | 'bas' | 'ok' = 'all';
  loading = false;
  errorMsg = '';
  successMsg = '';

  pdrToDelete: PieceRechange | null = null;
  showDeleteModal = false;

  readonly unites = UNITES_OPTIONS;

  constructor(private pdrService: PieceRechangeService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.pdrService.getAll().subscribe({
      next: data => { this.pdrList = data; this.applyFilter(); this.loading = false; },
      error: () => { this.errorMsg = 'Erreur lors du chargement.'; this.loading = false; }
    });
  }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filtered = this.pdrList.filter(p => {
      const matchSearch = p.nom.toLowerCase().includes(term) || p.code.toLowerCase().includes(term);
      const matchStock  = this.filterStock === 'all' ? true
        : this.filterStock === 'bas' ? this.isStockBas(p)
        : !this.isStockBas(p);
      return matchSearch && matchStock;
    });
  }

  isStockBas(p: PieceRechange): boolean {
    return p.stockActuel != null && p.stockMin != null && p.stockActuel < p.stockMin;
  }

  countStockBas(): number {
    return this.pdrList.filter(p => this.isStockBas(p)).length;
  }

  getSymbole(unite: string): string {
    return this.unites.find(u => u.value === unite)?.symbole ?? unite;
  }

  confirmDelete(pdr: PieceRechange): void { this.pdrToDelete = pdr; this.showDeleteModal = true; }
  cancelDelete(): void { this.pdrToDelete = null; this.showDeleteModal = false; }

  confirmDeleteAction(): void {
    if (!this.pdrToDelete?.id) return;
    this.pdrService.delete(this.pdrToDelete.id).subscribe({
      next: () => {
        this.successMsg = `PDR "${this.pdrToDelete!.nom}" supprimée.`;
        this.showDeleteModal = false;
        this.pdrToDelete = null;
        this.load();
        setTimeout(() => this.successMsg = '', 3000);
      },
      error: () => { this.errorMsg = 'Erreur lors de la suppression.'; this.showDeleteModal = false; }
    });
  }
}