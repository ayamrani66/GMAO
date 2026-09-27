import { Equipement } from './equipement.model';
import { DI } from './DI.models';
import { User } from './user.model';

export interface OT {
  id?: number;
  codeOT: string;
  titre: string;
  
  // Relations objets (pour l'affichage des détails)
  di?: DI;
  equipement?: Equipement;
  superviseur?: User;
  pieceRechange?: any; // Ou interface PieceRechange
  gamme?: any; // Ou interface Gamme
  
  // Énumérations (String en TS)
  statut: StatutOT;
  priorite: Priorite;
  natureAnomalie: string;
  typeOT: TypeOT;
  affectationTechnicien: string | null;

  // Dates et Durées
  dateCloture?: Date | string;
  dateDebutIntervention?: Date | string;
  dateFinIntervention?: Date | string;
  derniereExecution?: Date | string;
  dureeIntervention?: number; // En minutes (calculé côté Backend)

  // Listes
  actions: string[];
  otReseignes: Document[];
  pieceJointes: Document[];
  
  // Data additionnelle
  quantiteConsommee?: number;
}

// Pour sécuriser le typage dans vos composants
export enum StatutOT {
  EN_COURS = 'EN_COURS',
  CLOTURE = 'CLOTURE',
  ANNULE = 'ANNULE'
}

export enum Priorite {
  HAUTE = 'HAUTE',
  MOYENNE = 'MOYENNE',
  BASSE = 'BASSE'
}

export enum TypeOT {
  PREVENTIF = 'PREVENTIF',
  CORRECTIF = 'CORRECTIF'
}