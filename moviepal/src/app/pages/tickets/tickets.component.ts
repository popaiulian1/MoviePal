import { Component, OnInit } from '@angular/core';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../interfaces/ticket.interface';
import { TicketResponse } from '../../interfaces/ticket-response.interface';
import { AuthService } from '../../services/auth.service';
import { NzTableModule } from 'ng-zorro-antd/table'
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';


@Component({
  selector: 'app-tickets',
  standalone: true, 
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzFormModule,
    NzModalModule,
    NzTagModule],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss']
})
export class TicketsComponent implements OnInit {
  tickets: TicketResponse[] = [];
  loading = false;

  isEditModalVisible = false;
  editForm!: FormGroup;
  currentTicket!: Ticket | null;

  public error: string | null = null;

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadTickets();
    this.isEditModalVisible = true;
    this.editForm = this.fb.group({
      status: [''],
      numberOfSeats: ['']
    });
  }

  loadTickets(): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }
    console.log('Token:', this.authService.getToken());


    this.loading = true;
    this.ticketService.getTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 403) {
          this.error = 'You do not have permission to view tickets. Please contact an administrator.';
        } else {
          this.error = 'Unable to load tickets. Please check your connection or login again.';
        }
        console.error('Error fetching tickets:', err);
      }
    });
  }

  openEditModal(ticket: Ticket): void {
    console.log('Editing ticket:', ticket); 
    this.currentTicket = ticket;
    this.editForm.patchValue({
      status: ticket.status,
      numberOfSeats: ticket.numberOfSeats
    });
    this.isEditModalVisible = true;
  }

  cancelEdit(): void {
    this.isEditModalVisible = false;
    this.currentTicket = null;
  }

  submitEdit(): void {
    if (!this.currentTicket) return;

    const ticketId = this.currentTicket.id;
    const updatedData = this.editForm.value;
     const updatedTicket: Ticket = {
    ...this.currentTicket, // retain all original fields
    ...updatedData          // override with any new form values
  };

    this.ticketService.updateTicket(updatedTicket.id, updatedTicket).subscribe({
      next: (updatedTicket) => {
        if (updatedTicket) {
          this.tickets = this.tickets.map(t => {
            if (t.ticket.id === ticketId) {
              return {
                ...t,
                ticket: {
                  ...t.ticket,
                  status: updatedData.status,
                  numberOfSeats: updatedData.numberOfSeats
                }
              };
            }
            return t;
          });
        }
        this.isEditModalVisible = false;
        this.currentTicket = null;
      },
      error: (err) => {
        console.error('Failed to update ticket:', err);
        this.isEditModalVisible = false;
      }
    });
  }

  deleteTicket(ticketId: string): void {
    this.ticketService.deleteTicket(ticketId).subscribe({
      next: () => {
        this.tickets = this.tickets.filter(ticket => ticket.ticket.id !== ticketId);
      },
      error: (err) => {
        console.error('Failed to delete ticket', err);
      }
    });
  }

  trackById(index: number, item: TicketResponse): string {
    return item.ticket.id ?? index.toString();
  }
 
  retry() {
    this.error = null;
    this.loadTickets();
  }

}