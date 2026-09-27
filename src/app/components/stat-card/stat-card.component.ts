import { Component, input } from "@angular/core";

@Component({
  selector: "app-stat-card",
  standalone: true,
  templateUrl: "./stat-card.component.html",
  styleUrl: "./stat-card.component.scss",
})
export class StatCardComponent {
  label = input.required<string>();
  value = input.required<string>();
  hint = input<string>();
  tone = input<"neutral" | "gold" | "teal" | "danger">("neutral");
}
