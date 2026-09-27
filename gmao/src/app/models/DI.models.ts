
export interface DI {
equipementId: number;
  description: string;
  source: 'Production' | 'Inspection' | 'Maintenance';
  priorite: 'Urgent' | 'Haute' | 'Normale' | 'Basse';
  codeDI?: string;
}