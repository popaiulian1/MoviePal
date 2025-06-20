import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../services/movie.service';
import { featuredMovie } from '../../interfaces/featured-movie.interface';
import { MovieDetailed } from '../../interfaces/movie-detailed.interface';
import { MovieResponse } from '../../interfaces/movie-response.interface';
import { MatDialog } from '@angular/material/dialog';
import { MovieDetailDialogComponent } from '../../components/movie-detail-dialog/movie-detail-dialog.component';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.scss'],
})
export class MoviesComponent implements OnInit {
  movies: featuredMovie[] = [];
  page = 0;
  size = 34;
  selectedMovie: featuredMovie | null = null;

  constructor(private movieService: MovieService,  private dialog: MatDialog) {}

  ngOnInit(): void {
    this.movieService.getAllMovies(this.page, this.size).subscribe({
      next: (res: MovieResponse) => {
        this.movies = res.content;
      },
      error: (err) => {
        console.error('Error loading movies:', err);
      },
    });
  }

  openMovieDetails(movieId: string) {
    this.movieService.getMovieById(movieId, true).subscribe({
      next: (detailed: MovieDetailed) => {
        this.dialog.open(MovieDetailDialogComponent, {
          data: detailed,
          width: '400px',
          maxHeight:'90vh',
          panelClass: 'custom-dialog-panel'
        });
      },
      error: (err) => {
        console.error('Error loading movie details:', err);
      },
    });
  }
}
