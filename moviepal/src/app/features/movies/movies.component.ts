import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../../core/services/movie.service';
import { featuredMovie } from '../../core/interfaces/featured-movie.interface';
import { MovieDetailed } from '../../core/interfaces/movie-detailed.interface';
import { MovieResponse } from '../../core/interfaces/movie-response.interface';
import { Router } from '@angular/router';

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

  constructor(private movieService: MovieService,  private router: Router) {}

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
    // this.movieService.getMovieById(movieId, true).subscribe({
    //   next: (detailed: MovieDetailed) => {
    //     this.dialog.open(MovieDetailDialogComponent, {
    //       data: detailed,
    //       width: '1000px',
    //       maxHeight:'85vh',
    //       panelClass: 'custom-dialog-panel'
    //     });
    //   },
    //   error: (err) => {
    //     console.error('Error loading movie details:', err);
    //   },
    // });

    this.router.navigate(['/movie', movieId]).catch((err) => {
      console.error('Error navigating to movie details:', err);
    });
  }
}
