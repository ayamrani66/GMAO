// src/app/models/piece-rechange.model.ts

export type UniteCalcul =
  | 'GRAMME' | 'KILOGRAMME'
  | 'LITRE'  | 'MILLILITRE'
  | 'METRE'  | 'CENTIMETRE' | 'MILLIMETRE'
  | 'PIECE'  | 'UNITE'
  | 'BOITE'  | 'ROULEAU'   | 'TONNE';

export interface UniteOption {
  value: UniteCalcul;
  label: string;
  symbole: string;
}

export const UNITES_OPTIONS: UniteOption[] = [
  { value: 'GRAMME',      label: 'Gramme',      symbole: 'g'      },
  { value: 'KILOGRAMME',  label: 'Kilogramme',  symbole: 'kg'     },
  { value: 'LITRE',       label: 'Litre',       symbole: 'L'      },
  { value: 'MILLILITRE',  label: 'Millilitre',  symbole: 'mL'     },
  { value: 'METRE',       label: 'Mètre',       symbole: 'm'      },
  { value: 'CENTIMETRE',  label: 'Centimètre',  symbole: 'cm'     },
  { value: 'MILLIMETRE',  label: 'Millimètre',  symbole: 'mm'     },
  { value: 'PIECE',       label: 'Pièce',       symbole: 'pce'    },
  { value: 'UNITE',       label: 'Unité',       symbole: 'u'      },
  { value: 'BOITE',       label: 'Boîte',       symbole: 'boîte'  },
  { value: 'ROULEAU',     label: 'Rouleau',     symbole: 'rouleau'},
  { value: 'TONNE',       label: 'Tonne',       symbole: 't'      },
];

export interface PieceRechange {
  id?: number;
  nom: string;
  code: string;
  unite: UniteCalcul;
  quantiteStock?: number;
  seuilAlerte?: number;
  description?: string;
  fournisseur?: string;
  prixUnitaire?: number;
  emplacement?: string;
  dateCreation?: string;
  dateModification?: string;
  // piece-rechange.model.ts — ajouter
stockMin?: number;
stockMax?: number;
stockActuel?: number;
}