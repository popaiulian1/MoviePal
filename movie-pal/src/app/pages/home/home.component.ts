import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { featuredMovie } from '../../interfaces/featured-movie.interface';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

const BASE_API_URL = 'http://localhost:8080/api';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  movies: featuredMovie[] = [];
  page = 0;
  size = 10;
  loading = false;
  allLoaded = false;

  currentPage = 0;
  moviesPerPage = 5;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMovies();
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event): void {
    if(window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 
      && !this.loading && !this.allLoaded) {
      this.loadMovies();
    }
  }

  loadMovies(): void {
    this.loading = true;
    console.log('Fetching movies with parameters:', { page: this.page, size: this.size });
    
    this.http.get<featuredMovie[]>(`${BASE_API_URL}/movies?page=${this.page}&size=${this.size}`)
      .subscribe({
        next: (data) => {
          console.log('API Response For Movies:', data);
          
          if (data.length > 0) {
            this.movies.push(...data);
            this.page++;
            console.log('Updated movies array:', this.movies);
            console.log('New page number:', this.page);
          } else {
            this.allLoaded = true;
            console.log('All movies loaded, no more data available');
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error fetching movies:', error);
          this.loading = false;
        }
      });
  }

  get paginatedMovies(): featuredMovie[]{
    const start = this.currentPage * this.moviesPerPage;
    const end = start + this.moviesPerPage;

    if (end + this.moviesPerPage > this.movies.length && !this.allLoaded && !this.loading) {
      this.loadMovies();
    }

    return this.movies.slice(start, end);
  }

  nextPage(): void {
    if (this.hasMoreMovies()){
      this.currentPage++;
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
}
