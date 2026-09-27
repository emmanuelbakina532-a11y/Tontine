import { Injectable, computed, effect, signal } from '@angular/core';
import { Cotisation, Membre, NouvelleTontine, StatsGlobales, Tontine } from '../models/tontine.models';

const STORAGE_KEY = 'tontine-digitale.groupes.v1';

function genererId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function ajouterPeriode(dateIso: string, frequence: 'hebdomadaire' | 'mensuelle', pas: number): string {
  const d = new Date(dateIso);
  if (frequence === 'hebdomadaire') {
    d.setDate(d.getDate() + 7 * pas);
  } else {
    d.setMonth(d.getMonth() + pas);
  }
  return d.toISOString().slice(0, 10);
}

function donneesDemo(): Tontine[] {
  const dateDebut = new Date();
  dateDebut.setDate(dateDebut.getDate() - 14);
  const dateDebutIso = dateDebut.toISOString().slice(0, 10);

  const membres: Membre[] = [
    { id: genererId(), nom: 'Adèle Ngo Bassong', telephone: '6 77 12 34 56', ordre: 1 },
    { id: genererId(), nom: 'Bruno Fotso', telephone: '6 90 22 18 40', ordre: 2 },
    { id: genererId(), nom: 'Clarisse Ateba', telephone: '6 55 40 12 09', ordre: 3 },
    { id: genererId(), nom: 'Désiré Mbarga', telephone: '6 98 71 63 25', ordre: 4 },
    { id: genererId(), nom: 'Estelle Njoya', telephone: '6 71 33 90 14', ordre: 5 },
  ];

  const cotisations: Cotisation[] = [];
  membres.forEach((m) => {
    cotisations.push({ membreId: m.id, cycle: 1, paye: true, datePaiement: dateDebutIso });
  });
  membres.forEach((m, i) => {
    cotisations.push({ membreId: m.id, cycle: 2, paye: i < 3 });
  });

  return [
    {
      id: genererId(),
      nom: 'Tontine des Bâtisseuses',
      description: "Groupe d'épargne du quartier, cotisation chaque quinzaine.",
      montantCotisation: 10000,
      frequence: 'hebdomadaire',
      devise: 'FCFA',
      dateDebut: dateDebutIso,
      membres,
      cotisations,
      cycleActuel: 2,
      archivee: false,
    },
  ];
}

@Injectable({ providedIn: 'root' })
export class TontineService {
  private readonly _tontines = signal<Tontine[]>(this.chargerDepuisStockage());

  readonly tontines = computed(() => this._tontines().filter((t) => !t.archivee));
  readonly toutesLesTontines = this._tontines.asReadonly();

  constructor() {
    effect(() => {
      const valeur = this._tontines();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(valeur));
      } catch {
        // stockage indisponible (navigation privée, quota) : on continue en mémoire
      }
    });
  }

  private chargerDepuisStockage(): Tontine[] {
    try {
      const brut = localStorage.getItem(STORAGE_KEY);
      if (brut) {
        return JSON.parse(brut) as Tontine[];
      }
    } catch {
      // ignore et retombe sur les données de démonstration
    }
    return donneesDemo();
  }

  tontineParId(id: string): Tontine | undefined {
    return this._tontines().find((t) => t.id === id);
  }

  beneficiaireActuel(tontine: Tontine): Membre | undefined {
    if (tontine.membres.length === 0) return undefined;
    const position = ((tontine.cycleActuel - 1) % tontine.membres.length) + 1;
    return tontine.membres.find((m) => m.ordre === position);
  }

  dateProchaineCotisation(tontine: Tontine): string {
    return ajouterPeriode(tontine.dateDebut, tontine.frequence, tontine.cycleActuel - 1);
  }

  cotisationsDuCycle(tontine: Tontine, cycle = tontine.cycleActuel): Cotisation[] {
    return tontine.membres.map((m) => {
      const existante = tontine.cotisations.find((c) => c.membreId === m.id && c.cycle === cycle);
      return existante ?? { membreId: m.id, cycle, paye: false };
    });
  }

  montantCollecte(tontine: Tontine, cycle = tontine.cycleActuel): number {
    const payes = this.cotisationsDuCycle(tontine, cycle).filter((c) => c.paye).length;
    return payes * tontine.montantCotisation;
  }

  montantAttendu(tontine: Tontine): number {
    return tontine.membres.length * tontine.montantCotisation;
  }

  nombreRetards(tontine: Tontine): number {
    return this.cotisationsDuCycle(tontine).filter((c) => !c.paye).length;
  }

  creerTontine(donnees: NouvelleTontine): Tontine {
    const membres: Membre[] = donnees.membres
      .filter((m) => m.nom.trim().length > 0)
      .map((m, i) => ({ id: genererId(), nom: m.nom.trim(), telephone: m.telephone.trim(), ordre: i + 1 }));

    const nouvelle: Tontine = {
      id: genererId(),
      nom: donnees.nom.trim(),
      description: donnees.description?.trim(),
      montantCotisation: donnees.montantCotisation,
      frequence: donnees.frequence,
      devise: donnees.devise || 'FCFA',
      dateDebut: donnees.dateDebut,
      membres,
      cotisations: [],
      cycleActuel: 1,
      archivee: false,
    };
    this._tontines.update((liste) => [...liste, nouvelle]);
    return nouvelle;
  }

  modifierTontine(id: string, patch: Partial<Pick<Tontine, 'nom' | 'description' | 'montantCotisation' | 'frequence' | 'devise' | 'dateDebut'>>): void {
    this._tontines.update((liste) => liste.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  archiverTontine(id: string): void {
    this._tontines.update((liste) => liste.map((t) => (t.id === id ? { ...t, archivee: true } : t)));
  }

  ajouterMembre(tontineId: string, nom: string, telephone: string): void {
    this._tontines.update((liste) =>
      liste.map((t) => {
        if (t.id !== tontineId) return t;
        const ordreMax = t.membres.reduce((max, m) => Math.max(max, m.ordre), 0);
        const membre: Membre = { id: genererId(), nom: nom.trim(), telephone: telephone.trim(), ordre: ordreMax + 1 };
        return { ...t, membres: [...t.membres, membre] };
      }),
    );
  }

  retirerMembre(tontineId: string, membreId: string): void {
    this._tontines.update((liste) =>
      liste.map((t) => {
        if (t.id !== tontineId) return t;
        const membres = t.membres
          .filter((m) => m.id !== membreId)
          .sort((a, b) => a.ordre - b.ordre)
          .map((m, i) => ({ ...m, ordre: i + 1 }));
        const cotisations = t.cotisations.filter((c) => c.membreId !== membreId);
        return { ...t, membres, cotisations };
      }),
    );
  }

  basculerPaiement(tontineId: string, membreId: string, cycle: number): void {
    this._tontines.update((liste) =>
      liste.map((t) => {
        if (t.id !== tontineId) return t;
        const existe = t.cotisations.some((c) => c.membreId === membreId && c.cycle === cycle);
        let cotisations: Cotisation[];
        if (existe) {
          cotisations = t.cotisations.map((c) =>
            c.membreId === membreId && c.cycle === cycle
              ? { ...c, paye: !c.paye, datePaiement: !c.paye ? new Date().toISOString().slice(0, 10) : undefined }
              : c,
          );
        } else {
          cotisations = [
            ...t.cotisations,
            { membreId, cycle, paye: true, datePaiement: new Date().toISOString().slice(0, 10) },
          ];
        }
        return { ...t, cotisations };
      }),
    );
  }

  passerAuCycleSuivant(tontineId: string): void {
    this._tontines.update((liste) =>
      liste.map((t) => (t.id === tontineId ? { ...t, cycleActuel: t.cycleActuel + 1 } : t)),
    );
  }

  statsGlobales(): StatsGlobales {
    const actives = this.tontines();
    const membresTotal = actives.reduce((somme, t) => somme + t.membres.length, 0);
    const caissePrevueCycle = actives.reduce((somme, t) => somme + this.montantAttendu(t), 0);
    const collecteCycle = actives.reduce((somme, t) => somme + this.montantCollecte(t), 0);
    const retardsCycle = actives.reduce((somme, t) => somme + this.nombreRetards(t), 0);
    return {
      groupesActifs: actives.length,
      membresTotal,
      caissePrevueCycle,
      collecteCycle,
      retardsCycle,
      devise: actives[0]?.devise ?? 'FCFA',
    };
  }
}
