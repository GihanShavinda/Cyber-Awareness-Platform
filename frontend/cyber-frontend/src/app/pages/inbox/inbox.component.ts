import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CampaignService } from '../../services/campaign.service';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inbox.component.html',
  styleUrl: './inbox.component.css'
})
export class InboxComponent implements OnInit {
  campaigns: any[] = [];
  feedback: { [id: number]: any } = {};
  error = '';

  constructor(private campaignService: CampaignService) {}

  ngOnInit(): void {
    this.campaignService.getInbox().subscribe({
      next: (data) => (this.campaigns = data),
      error: (err) => (this.error = err.error?.message || 'Failed to load inbox'),
    });
  }

  respond(campaignId: number, action: string): void {
    this.campaignService.respond(campaignId, action).subscribe({
      next: (res) => (this.feedback[campaignId] = res),
      error: (err) => (this.error = err.error?.message || 'Failed to record response'),
    });
  }
}
