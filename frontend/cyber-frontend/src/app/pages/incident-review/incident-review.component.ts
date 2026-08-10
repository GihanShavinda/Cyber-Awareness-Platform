import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncidentService } from '../../services/incident.service';

@Component({
  selector: 'app-incident-review',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './incident-review.component.html',
  styleUrl: './incident-review.component.css'
})
export class IncidentReviewComponent implements OnInit {
  incidents: any[] = [];
  stats: any = null;
  error = '';
  statuses = ['open', 'reviewing', 'resolved', 'dismissed'];

  constructor(private incidentService: IncidentService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.incidentService.getAllIncidents().subscribe({
      next: (data) => (this.incidents = data),
      error: (err) => (this.error = err.error?.message || 'Failed to load incidents'),
    });
    this.incidentService.getStats().subscribe({
      next: (data) => (this.stats = data),
      error: () => {},
    });
  }

  updateStatus(inc: any, status: string): void {
    this.incidentService.updateIncident(inc.id, { status }).subscribe({
      next: () => this.load(),
      error: (err) => (this.error = err.error?.message || 'Failed to update'),
    });
  }

  saveNotes(inc: any): void {
    this.incidentService.updateIncident(inc.id, { reviewNotes: inc.reviewNotes }).subscribe({
      next: () => (inc._saved = true),
      error: (err) => (this.error = err.error?.message || 'Failed to save notes'),
    });
  }
}
