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
  size = 5;
  loading = false;
  allLoaded = false;

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
    this.http.get<featuredMovie[]>(`${BASE_API_URL}/movies?page=${this.page}&size=${this.size}`)
      .subscribe({
        next: (data) => {
          if (data.length > 0) {
          this.movies.push(...data);
            this.page++;
          } else {
            this.allLoaded = true;
          }
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        }
      });
  }

  
}
