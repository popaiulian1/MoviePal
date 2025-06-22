import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BASE_API_URL } from '../utils/api.url';
import { TicketResponse } from '../interfaces/ticket-response.interface';
import { Ticket } from '../interfaces/ticket.interface';


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

  getTickets(): Observable<TicketResponse[]> {
    console.log('Fetching all tickets');
    return this.http.get<TicketResponse[]>(`${BASE_API_URL}/tickets`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${window.localStorage.getItem('token') || window.sessionStorage.getItem('token')}`
      })
    }).pipe(
      catchError(error => {
        console.error('Error fetching tickets:', error);
        return throwError(() => error);
      })
    );
  }

  // getTicketsByUser(userId: string): Observable<Ticket[]> {
  //   console.log('Fetching tickets for user:', userId);
  //   return this.http.get<Ticket[]>(`${BASE_API_URL}/tickets/user/${userId}`).pipe(
  //     catchError(error => {
  //       console.error('Error fetching tickets:', error);
  //       return of([]);
  //     })
  //   );
  // }

  deleteTicket(ticketId: string): Observable<void> {
    console.log('Deleting ticket with ID:', ticketId);
    return this.http.delete<void>(`${BASE_API_URL}/tickets/${ticketId}`).pipe(
      catchError(error => {
        console.error('Error deleting ticket:', error);
        return of();
      })
    );
  }

  updateTicket(ticketId: string, ticketData: Partial<Ticket>): Observable<Ticket | null> {
    console.log('Updating ticket with ID:', ticketId, 'Data:', ticketData);
    return this.http.put<Ticket>(`${BASE_API_URL}/tickets/${ticketId}`, ticketData).pipe(
      catchError(error => {
        console.error('Error updating ticket:', error);
        return of(null);
      })
    );
  }
}
