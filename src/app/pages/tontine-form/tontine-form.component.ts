import { Component, computed, inject, input, signal } from "@angular/core";
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { TontineService } from "../../services/tontine.service";

@Component({
  selector: "app-tontine-form",
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "./tontine-form.component.html",
  styleUrl: "./tontine-form.component.scss",
})
export class TontineFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(TontineService);
  private readonly router = inject(Router);

  readonly id = input<string>();

  protected readonly modeEdition = computed(() => !!this.id());
  protected readonly tontineExistante = computed(() => {
    const id = this.id();
    return id ? this.service.tontineParId(id) : undefined;
  });

  protected readonly erreur = signal<string | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    nom: this.fb.nonNullable.control("", [Validators.required, Validators.minLength(2)]),
    description: this.fb.nonNullable.control(""),
    montantCotisation: this.fb.nonNullable.control(5000, [Validators.required, Validators.min(100)]),
    frequence: this.fb.nonNullable.control<"hebdomadaire" | "mensuelle">("mensuelle"),
    devise: this.fb.nonNullable.control("FCFA"),
    dateDebut: this.fb.nonNullable.control(new Date().toISOString().slice(0, 10)),
    membres: this.fb.array(
      [this.creerControleMembre(), this.creerControleMembre()],
    ),
  });

  constructor() {
    const existante = this.tontineExistante();
    if (existante) {
      this.form.patchValue({
        nom: existante.nom,
        description: existante.description ?? "",
        montantCotisation: existante.montantCotisation,
        frequence: existante.frequence,
        devise: existante.devise,
        dateDebut: existante.dateDebut,
      });
      this.membresArray.clear();
    }
  }

  get membresArray(): FormArray {
    return this.form.get("membres") as FormArray;
  }

  private creerControleMembre() {
    return this.fb.nonNullable.group({
      nom: this.fb.nonNullable.control("", Validators.required),
      telephone: this.fb.nonNullable.control(""),
    });
  }

  ajouterMembre(): void {
    this.membresArray.push(this.creerControleMembre());
  }

  retirerMembre(index: number): void {
    this.membresArray.removeAt(index);
  }

  enregistrer(): void {
    this.erreur.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.erreur.set("Vérifiez les champs en rouge avant de continuer.");
      return;
    }

    const valeurs = this.form.getRawValue();
    const existante = this.tontineExistante();

    if (existante) {
      this.service.modifierTontine(existante.id, {
        nom: valeurs.nom,
        description: valeurs.description,
        montantCotisation: valeurs.montantCotisation,
        frequence: valeurs.frequence,
        devise: valeurs.devise,
        dateDebut: valeurs.dateDebut,
      });
      this.router.navigate(["/groupes", existante.id]);
      return;
    }

    const membresValides = valeurs.membres.filter((m) => m.nom.trim().length > 0);
    if (membresValides.length < 2) {
      this.erreur.set("Ajoutez au moins deux membres pour former une tontine.");
      return;
    }

    const nouvelle = this.service.creerTontine({
      nom: valeurs.nom,
      description: valeurs.description,
      montantCotisation: valeurs.montantCotisation,
      frequence: valeurs.frequence,
      devise: valeurs.devise,
      dateDebut: valeurs.dateDebut,
      membres: membresValides,
    });
    this.router.navigate(["/groupes", nouvelle.id]);
  }
}
