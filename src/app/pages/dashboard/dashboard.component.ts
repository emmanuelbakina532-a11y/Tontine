import { Component, computed, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TontineService } from "../../services/tontine.service";
import { StatCardComponent } from "../../components/stat-card/stat-card.component";
import { EmptyStateComponent } from "../../components/empty-state/empty-state.component";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [RouterLink, StatCardComponent, EmptyStateComponent],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent {
  protected readonly service = inject(TontineService);

  protected readonly tontines = this.service.tontines;
  protected readonly stats = computed(() => this.service.statsGlobales());

  protected formaterMontant(valeur: number, devise: string): string {
    return `${valeur.toLocaleString("fr-FR")} ${devise}`;
  }

  protected beneficiaire(tontineId: string) {
    const t = this.service.tontineParId(tontineId);
    return t ? this.service.beneficiaireActuel(t) : undefined;
  }

  protected progression(tontineId: string): number {
    const t = this.service.tontineParId(tontineId);
    if (!t || t.membres.length === 0) return 0;
    const payes = this.service.cotisationsDuCycle(t).filter((c) => c.paye).length;
    return Math.round((payes / t.membres.length) * 100);
  }
}
