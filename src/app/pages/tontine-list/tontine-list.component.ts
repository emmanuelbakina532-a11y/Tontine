import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TontineService } from "../../services/tontine.service";
import { EmptyStateComponent } from "../../components/empty-state/empty-state.component";

@Component({
  selector: "app-tontine-list",
  standalone: true,
  imports: [RouterLink, EmptyStateComponent],
  templateUrl: "./tontine-list.component.html",
  styleUrl: "./tontine-list.component.scss",
})
export class TontineListComponent {
  protected readonly service = inject(TontineService);
  protected readonly tontines = this.service.tontines;

  protected formaterMontant(valeur: number, devise: string): string {
    return `${valeur.toLocaleString("fr-FR")} ${devise}`;
  }
}
