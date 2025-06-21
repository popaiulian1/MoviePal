import { Component, OnInit } from '@angular/core';
import { TicketService, Ticket } from '../../services/ticket.service';
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
    NzModalModule],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss']
})
export class TicketsComponent implements OnInit {
  tickets: Ticket[] = [];
  loading = false;

  isEditModalVisible = false;
  editForm!: FormGroup;
  currentTicket!: Ticket | null;

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadTickets();
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

  openEditModal(ticket: Ticket): void {
    this.currentTicket = ticket;
    this.editForm.setValue({
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

    const updatedTicket = {
      ...this.currentTicket,
      ...this.editForm.value
    };

    // Here you’d call an update method on TicketService (you may need to create this)
    console.log('Updated ticket:', updatedTicket);

    // Simulate update (replace with real service call)
    this.tickets = this.tickets.map(t =>
      t._id === updatedTicket._id ? updatedTicket : t
    );

    this.isEditModalVisible = false;
  }

  deleteTicket(ticketId: string): void {
    this.ticketService.deleteTicket(ticketId).subscribe({
      next: () => {
        this.tickets = this.tickets.filter(ticket => ticket._id !== ticketId);
      },
      error: (err) => {
        console.error('Failed to delete ticket', err);
      }
    });
  }

  trackById(index: number, item: Ticket): string {
    return item._id ?? index.toString();
  }
 

} 