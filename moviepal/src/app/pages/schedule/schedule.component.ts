import { Component } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { MovieService } from '../../services/movie.service';
import { MovieDetailed } from '../../interfaces/movie-detailed.interface';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [ NzTableModule, NzDividerModule ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
})
export class ScheduleComponent {

  constructor (private movieService: MovieService) { }

  moviesData!: MovieDetailed[];

  ngOnInit() {
    this.loadMovies();
  }

  loadMovies() {
    this.movieService.getAllMovies(0, 34, 'title', true).subscribe({
      next: (response) => {
        if (response && response.content) {
        this.moviesData = response.content.map((movie: any) => ({
          ...movie,
          entry: movie.entry ?? null,
          cinema: movie.cinema ?? { name: 'No cinema', location: 'Unknown' }
        }));
        console.log('Movies loaded successfully:', this.moviesData);
      } else {
        console.error('Invalid response format:', response);
        this.moviesData = [];
      }
      },
      error: (error) => {
        console.error('Error loading movies:', error);
      }
    });
  }

}
