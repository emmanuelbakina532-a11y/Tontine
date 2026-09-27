import { Component, input } from "@angular/core";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-empty-state",
  standalone: true,
  imports: [RouterLink],
  templateUrl: "./empty-state.component.html",
  styleUrl: "./empty-state.component.scss",
})
export class EmptyStateComponent {
  title = input.required<string>();
  message = input.required<string>();
  actionLabel = input<string>();
  actionLink = input<string>();
}
