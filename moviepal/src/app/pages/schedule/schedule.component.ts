import { Component, OnInit } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { MovieService } from '../../services/movie.service';
import { MovieDetailed } from '../../interfaces/movie-detailed.interface';
import { Router } from '@angular/router';
import { Ticket } from '../../interfaces/ticket-interface';
import { AuthService } from '../../services/auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BASE_API_URL } from '../../utils/api.url';

@Component({
  selector: 'app-schedule',
  standalone: true,
  imports: [ NzTableModule, NzDividerModule ],
  templateUrl: './schedule.component.html',
  styleUrl: './schedule.component.scss'
})
export class ScheduleComponent implements OnInit {

  constructor (private movieService: MovieService, private router: Router,
    private authService: AuthService, private http: HttpClient
  ) { }

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

  bookTicket(movie: MovieDetailed) {
    try {
      if (!movie || !movie.entry) {
        console.error('Invalid movie data for booking:', movie);
        return;
      }

      console.log('Booking ticket for movie:', movie.entry.title);

      this.authService.currentUser.subscribe(user => {
        if (!user || !user.username) {
          console.error('User not logged in or username not available');
          return;
        }
        const ticket: Ticket = {
          id: Math.random().toString(36).substring(2, 15),
          userId: user.username,
          movieId: movie.entry.id,
          cinemaId: movie.cinema.id,
          showTime: new Date(),
          numberOfSeats: 2,
          totalPrice: movie.entry.ticketPrice * 2,
          bookingDate: new Date().toISOString(),
          status: 'Booked'
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
      });

      

    }
    catch (error) {
      console.error('Error in bookTicket method:', error);
      return;
    }
  }

  routeToMovie(movie: any) {
    if (!movie || !movie.id) {
    console.error('Invalid movie data for navigation:', movie);
    return;
  }
  
  console.log('Navigating to movie:', movie.title, 'with ID:', movie.id);
  
  this.router.navigate(['/movies', movie.id])
    .then(() => console.log('Navigation successful'))
    .catch(error => console.error('Navigation failed:', error));
}

}
