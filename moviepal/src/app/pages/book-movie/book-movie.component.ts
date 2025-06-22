import { Component, OnInit } from '@angular/core';
import { MovieDetailed } from '../../interfaces/movie-detailed.interface';
import { MovieService } from '../../services/movie.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { BASE_API_URL } from '../../utils/api.url';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Ticket } from '../../interfaces/ticket.interface';

@Component({
  selector: 'app-book-movie',
  imports: [],
  templateUrl: './book-movie.component.html',
  styleUrl: './book-movie.component.scss'
})
export class BookMovieComponent implements OnInit {
  movie: MovieDetailed | null = null;
  embededUrl: SafeResourceUrl | null = null;
  numberOfSeats: number = 1;

  constructor(
    private movieService: MovieService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const movieIdFromURL = this.getMovieIdFromUrl();

    if (!movieIdFromURL) {
      console.error('No movie ID found in the URL');
      return;
    }

    this.loadMovie(movieIdFromURL);
    window.scrollTo({top: 0, behavior: 'smooth'});
  }

  loadMovie(movieId: string) {
    this.movieService.getMovieById(movieId, true).subscribe({
      next: (movie: MovieDetailed) => {
        this.movie = movie;
        this.embededUrl = this.embedUrl();
        console.log('Movie details loaded successfully:', this.movie.entry.id);
      }
    });
  }

  embedUrl(): SafeResourceUrl | null {
    if (!this.movie || !this.movie.entry || !this.movie.entry.trailerUrl) {
      console.error('No URL available for the movie');
      return null;
    }
    let url = this.movie.entry.trailerUrl.replace('watch?v=', 'embed/');
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  goBack() {
    this.router.navigate(['/movies']);
  }

  getMovieIdFromUrl(): string | null {
    const url = window.location.href;
    const match = url.match(/\/movie\/([^/?#]+)/);
    console.log('Current URL:', url);
    console.log('Extracted movie ID:', match ? match[1] : 'No match found');
    return match ? match[1] : null;
  }

  onSeatsInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const seats = Math.max(1, Number(value));
    this.numberOfSeats = seats;
  }

  bookTicket(showTime: string) {
    try {
      if (!this.movie) {
        console.error('Invalid movie data for booking:', this.movie);
        return;
      }

      console.log('Booking ticket for movie:', this.movie.entry.title);

      this.authService.currentUser.subscribe(user => {
        if (!user || !user.username) {
          console.error('User not logged in or username not available');
          return;
        }

        var ticket: Ticket;

        if(this.movie){
          ticket = {
            id: Math.random().toString(36).substring(2, 15),
            userId: user.username,
            movieId: this.movie.entry.id,
            cinemaId: this.movie.cinema.id,
            showTime: showTime,
            numberOfSeats: this.numberOfSeats,
            totalPrice: Number(this.movie.entry.ticketPrice) * this.numberOfSeats,
            bookingDate: new Date().toISOString(),
            status: 'BOOKED'
          };

          const token = this.authService.getToken();
          if (!token) {
            console.error('No JWT token found');
            return;
          }
          const headers = new HttpHeaders({
            Authorization: `Bearer ${token}`
          });

          this.http.post(BASE_API_URL + '/tickets', ticket, {headers}).subscribe({
            next: (response) => {
              console.log('Ticket booked successfully:', response);
            },
            error: (error) => {
              console.error('Error booking ticket:', error);
            }
          })
          console.log('Ticket created:', ticket);
          }
      });
    }
    catch (error) {
      console.error('Error in bookTicket method:', error);
      return;
    }
  }
}
