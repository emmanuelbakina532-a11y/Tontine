import { Component, computed, inject, input, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { TontineService } from "../../services/tontine.service";
import { RotationWheelComponent } from "../../components/rotation-wheel/rotation-wheel.component";
import { StatCardComponent } from "../../components/stat-card/stat-card.component";

@Component({
  selector: "app-tontine-detail",
  standalone: true,
  imports: [RouterLink, FormsModule, RotationWheelComponent, StatCardComponent],
  templateUrl: "./tontine-detail.component.html",
  styleUrl: "./tontine-detail.component.scss",
})
export class TontineDetailComponent {
  protected readonly service = inject(TontineService);
  private readonly router = inject(Router);

  readonly id = input.required<string>();

  protected readonly tontine = computed(() => this.service.tontineParId(this.id()));

  protected readonly cotisations = computed(() => {
    const t = this.tontine();
    return t ? this.service.cotisationsDuCycle(t) : [];
  });

  protected readonly membreDe = (membreId: string) =>
    this.tontine()?.membres.find((m) => m.id === membreId);

  protected formaterMontant(valeur: number, devise: string): string {
    return `${valeur.toLocaleString("fr-FR")} ${devise}`;
  }

  protected formaterDate(iso: string): string {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  }

  protected basculer(membreId: string): void {
    const t = this.tontine();
    if (!t) return;
    this.service.basculerPaiement(t.id, membreId, t.cycleActuel);
  }

  protected clorreLeTour(): void {
    const t = this.tontine();
    if (!t) return;
    this.service.passerAuCycleSuivant(t.id);
  }

  protected retirerMembre(membreId: string): void {
    const t = this.tontine();
    if (!t) return;
    this.service.retirerMembre(t.id, membreId);
  }

  protected archiver(): void {
    const t = this.tontine();
    if (!t) return;
    this.service.archiverTontine(t.id);
    this.router.navigate(["/groupes"]);
  }

  protected readonly afficherFormulaireMembre = signal(false);
  protected nouveauNom = "";
  protected nouveauTelephone = "";

  protected ajouterMembreRapide(): void {
    const t = this.tontine();
    if (!t || this.nouveauNom.trim().length === 0) return;
    this.service.ajouterMembre(t.id, this.nouveauNom, this.nouveauTelephone);
    this.nouveauNom = "";
    this.nouveauTelephone = "";
    this.afficherFormulaireMembre.set(false);
  }
}
