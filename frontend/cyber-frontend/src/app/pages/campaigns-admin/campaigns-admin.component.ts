import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CampaignService } from '../../services/campaign.service';

@Component({
  selector: 'app-campaigns-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './campaigns-admin.component.html',
  styleUrl: './campaigns-admin.component.css'
})
export class CampaignsAdminComponent implements OnInit {
  campaigns: any[] = [];
  error = '';
  success = '';

  // create form
  name = '';
  emailSubject = '';
  emailBody = '';
  difficulty = 'medium';
  difficulties = ['easy', 'medium', 'hard'];

  // schedule inputs, keyed by campaign id
  scheduleMinutes: { [id: number]: number } = {};

  constructor(private campaignService: CampaignService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.campaignService.getAll().subscribe({
      next: (data) => (this.campaigns = data),
      error: (err) => (this.error = err.error?.message || 'Failed to load campaigns'),
    });
  }

  create(): void {
    this.error = '';
    this.success = '';
    if (!this.name || !this.emailSubject || !this.emailBody) {
      this.error = 'Name, subject and body are required';
      return;
    }
    this.campaignService.create({
      name: this.name,
      emailSubject: this.emailSubject,
      emailBody: this.emailBody,
      difficulty: this.difficulty,
    }).subscribe({
      next: () => {
        this.success = 'Campaign created';
        this.name = ''; this.emailSubject = ''; this.emailBody = ''; this.difficulty = 'medium';
        this.load();
      },
      error: (err) => (this.error = err.error?.message || 'Failed to create'),
    });
  }

  scheduleCampaign(c: any): void {
    const mins = this.scheduleMinutes[c.id];
    if (!mins || mins <= 0) {
      this.error = 'Enter minutes from now (greater than 0)';
      return;
    }
    this.campaignService.schedule(c.id, mins).subscribe({
      next: (res) => {
        this.success = `"${c.name}" scheduled to fire in ${res.willFireInSeconds}s`;
        this.error = '';
        this.load();
      },
      error: (err) => (this.error = err.error?.message || 'Failed to schedule'),
    });
  }
}
