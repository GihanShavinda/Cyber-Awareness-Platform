import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamificationService } from '../../services/gamification.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css'
})
export class LeaderboardComponent implements OnInit {
  players: any[] = [];
  currentUserId: number | null = null;
  error = '';

  constructor(
    private gamificationService: GamificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUser()?.id ?? null;
    this.gamificationService.getLeaderboard().subscribe({
      next: (data) => (this.players = data),
      error: (err) => (this.error = err.error?.message || 'Failed to load leaderboard'),
    });
  }

  medal(index: number): string {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}`;
  }
}
