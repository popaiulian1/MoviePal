import {BASE_API_URL} from '../utils/api.url';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MovieResponse } from '../interfaces/movie-response.interface';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
    constructor(private http: HttpClient) {}

    getFeaturedMovies(page: number, size: number): Observable<MovieResponse> {
        console.log('Fetching featured movies with page:', page, 'and size:', size);
        return this.http.get<MovieResponse>(`${BASE_API_URL}/movies/featured?page=${page}&size=${size}`);
    }

    getMovieById(id: string, includeCinemaDetails: boolean = false): Observable<any> {
    console.log('Fetching movie by ID:', id, 'with includeCinemaDetails:', includeCinemaDetails);
    const endpoint = includeCinemaDetails ? `/movies/${id}/details` : `/movies/${id}`;
    return this.http.get<any>(`${BASE_API_URL}${endpoint}`);
  }

    getMoviesByGenre(genre: string, page: number, size: number): Observable<MovieResponse> {
        console.log('Fetching movies by genre:', genre, 'with page:', page, 'and size:', size);
        return this.http.get<MovieResponse>(`${BASE_API_URL}/movies/genre/${genre}?page=${page}&size=${size}`);
    }

    getMoviesBySearchTerm(searchTerm: string, page: number, size: number): Observable<any> {
        console.log('Fetching movies with search term:', searchTerm);
        return this.http.get<any>(`${BASE_API_URL}/movies/search?query=${encodeURIComponent(searchTerm)}`)
            .pipe(
                map(response => {
                    if (Array.isArray(response)) {
                        console.log('Search response is an array:', response);
                        return { content: response };
                    } else if (response && response.content) {
                        return response;
                    } else {
                        console.warn('Unexpected search response format:', response);
                        return { content: [] };
                    }
                }),
                catchError(error => {
                  console.error('Error fetching movies by search term:', error);
                  return of({ content: [] });
                })
            );
    }

    getMoviesByActor(actorName: string, page: number, size: number): Observable<MovieResponse> {
        console.log('Fetching movies by actor:', actorName, 'with page:', page, 'and size:', size);
        return this.http.get<MovieResponse>(`${BASE_API_URL}/movies/actor/${actorName}?page=${page}&size=${size}`);
    }

    getMoviesByDirector(directorName: string, page: number, size: number): Observable<MovieResponse> {
        console.log('Fetching movies by director:', directorName, 'with page:', page, 'and size:', size);
        return this.http.get<MovieResponse>(`${BASE_API_URL}/movies/director/${directorName}?page=${page}&size=${size}`);
    }

    getAllMovies(page: number, size: number, sort: string = 'title', includeCinemaDetails: boolean = false): Observable<MovieResponse> {
    console.log('Fetching all movies with page:', page, 'size:', size, 'sort:', sort, 'includeCinemaDetails:', includeCinemaDetails);
    return this.http.get<MovieResponse>(
      `${BASE_API_URL}/movies?page=${page}&size=${size}&sort=${sort}&includeCinemaDetails=${includeCinemaDetails}`
    );
  }
}