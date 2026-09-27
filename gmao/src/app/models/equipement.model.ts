export interface Equipement {
  id?: number;
  codeEquipement: string;
  codeParent?: string;
  parentId?: number;
  archive?: boolean;
  causeArchivage?: string;
  libelle?: string;
  compteur?: number;
  niveau?: number;
  dateInstallation: Date | string; // IMPORTANT
  criticite: 'Faible' | 'Moyenne' | 'Elevee';
  expanded?: boolean;
  localisation?: string;
}