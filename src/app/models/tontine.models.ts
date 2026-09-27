export type Frequence = 'hebdomadaire' | 'mensuelle';

export interface Membre {
  id: string;
  nom: string;
  telephone: string;
  ordre: number; // position dans le tour de rotation, à partir de 1
}

export interface Cotisation {
  membreId: string;
  cycle: number;
  paye: boolean;
  datePaiement?: string;
}

export interface Tontine {
  id: string;
  nom: string;
  description?: string;
  montantCotisation: number;
  frequence: Frequence;
  devise: string;
  dateDebut: string; // ISO date
  membres: Membre[];
  cotisations: Cotisation[];
  cycleActuel: number; // 1-indexé
  archivee: boolean;
}

export interface NouvelleTontine {
  nom: string;
  description?: string;
  montantCotisation: number;
  frequence: Frequence;
  devise: string;
  dateDebut: string;
  membres: { nom: string; telephone: string }[];
}

export interface StatsGlobales {
  groupesActifs: number;
  membresTotal: number;
  caissePrevueCycle: number;
  collecteCycle: number;
  retardsCycle: number;
  devise: string;
}
