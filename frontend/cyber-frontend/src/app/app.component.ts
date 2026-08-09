import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HealthService } from './services/health.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'cyber-frontend';
  health: any = null;
  error: string | null = null;

  constructor(private healthService: HealthService) {}

  ngOnInit(): void {
    this.healthService.getHealth().subscribe({
      next: (data) => (this.health = data),
      error: (err) => (this.error = 'Could not reach backend: ' + err.message),
    });
  }
}
