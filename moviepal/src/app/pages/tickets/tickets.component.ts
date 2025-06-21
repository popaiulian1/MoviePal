import { Component, OnInit } from '@angular/core';
import { TicketService, Ticket } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';
import { NzTableModule } from 'ng-zorro-antd/table'
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tickets',
  standalone: true, 
  imports: [CommonModule, NzTableModule],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss']
})
export class TicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  loading: boolean = false;

  constructor(
    private ticketService: TicketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    this.loading = true;
    this.ticketService.getTicketsByUser(currentUser.username).subscribe({
      next: (data) => {
        this.tickets = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load tickets', err);
        this.loading = false;
      }
    });
  }

  deleteTicket(ticketId: string): void {
    this.ticketService.deleteTicket(ticketId).subscribe({
      next: () => {
        this.tickets = this.tickets.filter(ticket => ticket.id !== ticketId);
      },
      error: (err) => {
        console.error('Failed to delete ticket', err);
      }
    });
  }

  trackById(index: number, item: Ticket): string {
    return item.id ?? index.toString();
  }
}
