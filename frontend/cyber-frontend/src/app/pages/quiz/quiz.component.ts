import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuizService } from '../../services/quiz.service';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css'
})
export class QuizComponent implements OnInit {
  quizId!: number;
  quiz: any = null;
  selectedAnswers: { [questionId: number]: number } = {};
  result: any = null;
  error = '';

  constructor(private route: ActivatedRoute, private quizService: QuizService) {}

  ngOnInit(): void {
    this.quizId = Number(this.route.snapshot.paramMap.get('id'));
    this.quizService.getQuiz(this.quizId).subscribe({
      next: (data) => (this.quiz = data),
      error: (err) => (this.error = err.error?.message || 'Failed to load quiz'),
    });
  }

  selectAnswer(questionId: number, answerId: number): void {
    this.selectedAnswers[questionId] = answerId;
  }

  submit(): void {
    const answers = Object.keys(this.selectedAnswers).map((qId) => ({
      questionId: Number(qId),
      answerId: this.selectedAnswers[Number(qId)],
    }));

    if (answers.length < this.quiz.questions.length) {
      this.error = 'Please answer all questions before submitting.';
      return;
    }

    this.quizService.submitQuiz(this.quizId, answers).subscribe({
      next: (data) => {
        this.result = data;
        this.error = '';
      },
      error: (err) => (this.error = err.error?.message || 'Failed to submit quiz'),
    });
  }
}
