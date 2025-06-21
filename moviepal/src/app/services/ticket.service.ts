import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BASE_API_URL } from '../utils/api.url';

export interface Ticket {
  id?: string;
  userId: string;
  movieId: string;
  movieTitle: string;
  cinemaName: string;
  showtime: string;
  posterUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  constructor(private http: HttpClient) {}

  bookTicket(ticket: Ticket): Observable<Ticket | null> {
    console.log('Booking ticket:', ticket);
    return this.http.post<Ticket>(`${BASE_API_URL}/tickets`, ticket).pipe(
      catchError(error => {
        console.error('Error booking ticket:', error);
        return of(null);
      })
    );
  }

  getTicketsByUser(userId: string): Observable<Ticket[]> {
    console.log('Fetching tickets for user:', userId);
    return this.http.get<Ticket[]>(`${BASE_API_URL}/tickets/user/${userId}`).pipe(
      catchError(error => {
        console.error('Error fetching tickets:', error);
        return of([]);
      })
    );
  }

  deleteTicket(ticketId: string): Observable<void> {
    console.log('Deleting ticket with ID:', ticketId);
    return this.http.delete<void>(`${BASE_API_URL}/tickets/${ticketId}`).pipe(
      catchError(error => {
        console.error('Error deleting ticket:', error);
        return of();
      })
    );
  }
}
