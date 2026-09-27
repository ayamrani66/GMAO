import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { DiService } from '../../services/di.service';
import { OtService } from '../../services/ot.service';

@Component({
  selector: 'app-modules',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './modules.component.html',
  styleUrls: ['./modules.component.css']
})
export class ModulesComponent implements OnInit {
  currentUser: any = null;
  isResponsable = false;

  constructor(private authService: AuthService, private diService: DiService, private otService: OtService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (this.currentUser && this.currentUser.role) {
      const role = this.currentUser.role.toUpperCase();
      // On définit qui a accès au module "Utilisateurs"
      this.isResponsable = role === 'RESPONSABLE';
    }
  }

}