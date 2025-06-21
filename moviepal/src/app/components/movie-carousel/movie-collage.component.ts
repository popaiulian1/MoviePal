import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { featuredMovie } from '../../interfaces/featured-movie.interface';
import { CommonModule } from '@angular/common';
import { MovieResponse } from '../../interfaces/movie-response.interface';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { MovieService } from '../../services/movie.service';
import { RouterLink } from '@angular/router';

interface MovieWithRotation extends featuredMovie {
  rotation?: number;
}

@Component({
  selector: 'app-movie-collage',
  standalone: true,
  imports: [HttpClientModule, CommonModule, NzIconModule, RouterLink],
  templateUrl: './movie-collage.component.html',
  styleUrl: './movie-collage.component.scss'
})
export class MovieCollageComponent implements OnInit {
  movies: MovieWithRotation[] = [];
  page = 0;
  size = 10;
  loading = false;
  allLoaded = false;

  currentPage = 0;
  moviesPerPage = 8;

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    if (this.loading || this.allLoaded) return;
    
    this.loading = true;
    console.log('Fetching movies with parameters:', { page: this.page, size: this.size });
    
    this.movieService.getFeaturedMovies(this.page, this.size)
      .subscribe({
        next: (response) => {
          console.log('API Response For Movies:', response);
          
          if (response && response.content && response.content.length > 0) {
            // Assign a random rotation to each movie
            const newMovies = response.content.map((movie: featuredMovie) => ({
              ...movie,
              rotation: this.generateRandomRotation()
            }));
            
            this.movies.push(...newMovies);
            this.page++;
            console.log('Updated movies array:', this.movies);
            console.log('New page number:', this.page);
            
            // Check if we've reached the last page
            if (response.last) {
              this.allLoaded = true;
              console.log('All movies loaded, no more data available');
            }
          } else {
            this.allLoaded = true;
            console.log('No movies in response or empty response');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching movies:', error);
          this.loading = false;
        }
      });
  }

  get paginatedMovies(): MovieWithRotation[] {
    const start = this.currentPage * this.moviesPerPage;
    const end = start + this.moviesPerPage;
    return this.movies.slice(start, end);
  }

  nextPage(): void {
    if (this.hasMoreMovies()) {
      this.currentPage++;

      const end = (this.currentPage + 1) * this.moviesPerPage;
      if (end >= this.movies.length && !this.allLoaded && !this.loading) {
        this.loadMovies();
      }
    }
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
    }
  }

  hasMoreMovies(): boolean {
    return (this.currentPage + 1) * this.moviesPerPage < this.movies.length || !this.allLoaded;
  }

  private generateRandomRotation(): number {
    return Math.random() * 6 - 3;
  }
}
