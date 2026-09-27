import { Component, computed, input } from "@angular/core";
import { Membre } from "../../models/tontine.models";

interface Emplacement {
  membre: Membre;
  x: number;
  y: number;
  estActuel: boolean;
  estPasse: boolean;
}

@Component({
  selector: "app-rotation-wheel",
  standalone: true,
  templateUrl: "./rotation-wheel.component.html",
  styleUrl: "./rotation-wheel.component.scss",
})
export class RotationWheelComponent {
  membres = input.required<Membre[]>();
  cycleActuel = input.required<number>();

  private readonly rayon = 84;
  private readonly centre = 100;

  emplacements = computed<Emplacement[]>(() => {
    const liste = [...this.membres()].sort((a, b) => a.ordre - b.ordre);
    const total = liste.length || 1;
    const positionActuelle = ((this.cycleActuel() - 1) % total) + 1;
    return liste.map((membre, i) => {
      const angle = (2 * Math.PI * i) / total - Math.PI / 2;
      return {
        membre,
        x: this.centre + this.rayon * Math.cos(angle),
        y: this.centre + this.rayon * Math.sin(angle),
        estActuel: membre.ordre === positionActuelle,
        estPasse: membre.ordre < positionActuelle,
      };
    });
  });

  beneficiaire = computed(() => this.emplacements().find((e) => e.estActuel)?.membre);

  initiales(nom: string): string {
    return nom
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((mot) => mot[0]?.toUpperCase())
      .join("");
  }
}
