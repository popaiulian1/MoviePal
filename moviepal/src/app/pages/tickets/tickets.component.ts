import { Component, OnInit } from '@angular/core';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../interfaces/ticket.interface';
import { TicketResponse } from '../../interfaces/ticket-response.interface';
import { AuthService } from '../../services/auth.service';
import { NzTableModule, NzTableSortFn, NzTableSortOrder } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators 
} from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Cinema } from '../../interfaces/cinema.interface';
import { featuredMovie } from '../../interfaces/featured-movie.interface';
import { MovieService } from '../../services/movie.service';

// Define the column interface
interface ColumnItem {
  title: string;
  compare?: (a: TicketResponse, b: TicketResponse) => number;
  priority?: number;
  sortFn?: NzTableSortFn<TicketResponse> | null;
  sortPriority?: number;
  sortDirections?: NzTableSortOrder[];
}

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzFormModule,
    NzModalModule,
    NzTagModule,
  ],
  templateUrl: './tickets.component.html',
  styleUrls: ['./tickets.component.scss'],
})
export class TicketsComponent implements OnInit {
  tickets: TicketResponse[] = [];
  loading = false;
  isCreateModalVisible = false;
  createForm!: FormGroup;
  isEditModalVisible = false;
  editForm!: FormGroup;
  currentTicket!: Ticket | null;

  movies: featuredMovie[] = [];
  cinemas: Cinema[] = [];
  allCinemas: Cinema[] = [];

  availableShowtimes: string[] = [];

  public error: string | null = null;

  sortName: string | null = null;
  sortValue: string | null = null;

  searchText = '';
  filteredTickets: TicketResponse[] = [];
  
  columns: ColumnItem[] = [
    {
      title: 'Ticket ID',
      sortFn: (a: TicketResponse, b: TicketResponse) => a.ticket.id.localeCompare(b.ticket.id)
    },
    {
      title: 'Movie',
      sortFn: (a: TicketResponse, b: TicketResponse) => a.movie.title.localeCompare(b.movie.title)
    },
    {
      title: 'Cinema',
      sortFn: (a: TicketResponse, b: TicketResponse) => a.cinema.name.localeCompare(b.cinema.name)
    },
    {
      title: 'Showtime',
      sortFn: (a: TicketResponse, b: TicketResponse) => a.ticket.showTime.localeCompare(b.ticket.showTime)
    },
    {
      title: 'Seats',
      sortFn: (a: TicketResponse, b: TicketResponse) => a.ticket.numberOfSeats - b.ticket.numberOfSeats
    },
    {
      title: 'Total Price',
      sortFn: (a: TicketResponse, b: TicketResponse) => a.ticket.totalPrice - b.ticket.totalPrice
    },
    {
      title: 'Booking Date',
      sortFn: (a: TicketResponse, b: TicketResponse) => 
        new Date(a.ticket.bookingDate).getTime() - new Date(b.ticket.bookingDate).getTime()
    },
    {
      title: 'Status',
      sortFn: (a: TicketResponse, b: TicketResponse) => a.ticket.status.localeCompare(b.ticket.status)
    }
  ];

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadTickets();
    
    this.editForm = this.fb.group({
      status: [''],
      numberOfSeats: [''],
    });

    this.createForm = this.fb.group({
      movieId: [null, Validators.required],
      cinemaId: [null, Validators.required],
      showTime: ['', Validators.required],
      numberOfSeats: [1, [Validators.required, Validators.min(1)]],
      status: ['BOOKED', Validators.required]
    });
    
    this.createForm.get('movieId')?.valueChanges.subscribe(movieId => {
      this.onMovieChange(movieId);
    });

    this.filteredTickets = [...this.tickets];
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
        this.filteredTickets = [...data]; // Initialize filtered tickets
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        if (err.status === 403) {
          this.error =
            'You do not have permission to view tickets. Please contact an administrator.';
        } else {
          this.error =
            'Unable to load tickets. Please check your connection or login again.';
        }
        console.error('Error fetching tickets:', err);
      },
    });
  }

  openEditModal(ticket: Ticket): void {
    console.log('Editing ticket:', ticket);
    this.currentTicket = ticket;
    this.editForm.patchValue({
      status: ticket.status,
      numberOfSeats: ticket.numberOfSeats,
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
      ...this.currentTicket,
      ...updatedData, 
    };

    this.ticketService.updateTicket(updatedTicket.id, updatedTicket).subscribe({
      next: (updatedTicket) => {
        if (updatedTicket) {
          this.tickets = this.tickets.map((t) => {
            if (t.ticket.id === ticketId) {
              return {
                ...t,
                ticket: {
                  ...t.ticket,
                  status: updatedData.status,
                  numberOfSeats: updatedData.numberOfSeats,
                },
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
      },
    });
  }

  deleteTicket(ticketId: string): void {
    this.ticketService.deleteTicket(ticketId).subscribe({
      next: () => {
        this.tickets = this.tickets.filter(
          (ticket) => ticket.ticket.id !== ticketId
        );
        console.log('Ticket deleted successfully');
        this.isEditModalVisible = false;
        // fallback pt ca ticketul sters nu a disparut in unele cazuir (?!?)
        this.retry();
      },
      error: (err) => {
        console.error('Failed to delete ticket', err);
      },
    });
  }

  trackById(index: number, item: TicketResponse): string {
    return item.ticket.id ?? index.toString();
  }

  retry() {
    this.error = null;
    this.loadTickets();
  }

  openCreateModal(): void {
    this.createForm.reset({
      status: 'BOOKED',
      numberOfSeats: 1
    });
    
    this.ticketService.getMovies().subscribe({
      next: (data) => {
        this.movies = data;
        console.log('Loaded movies:', this.movies);
      },
      error: (err) => console.error('Error loading movies:', err)
    });
    
    this.ticketService.getCinemas().subscribe({
      next: (data) => {
        this.allCinemas = data;
        this.cinemas = [...data];
        console.log('Loaded cinemas:', this.cinemas);
      },
      error: (err) => console.error('Error loading cinemas:', err)
    });
    
    this.isCreateModalVisible = true;
  }

  onMovieChange(movieId: string): void {
    if (!movieId) {
      this.cinemas = [...this.allCinemas];
      this.availableShowtimes = [];
      return;
    }
    
    const selectedMovie = this.movies.find(movie => movie.id === movieId);
    
    if (selectedMovie) {
      if (selectedMovie.cinemaId) {
        this.cinemas = this.allCinemas.filter(cinema => 
          cinema.id === selectedMovie.cinemaId
        );
        
        if (this.cinemas.length === 1) {
          this.createForm.patchValue({
            cinemaId: this.cinemas[0].id
          });
        }
      }

      this.availableShowtimes = selectedMovie.showTimes || [];
      console.log('Available showtimes:', this.availableShowtimes);

      if (this.availableShowtimes.length === 1) {
        this.createForm.patchValue({
          showTime: this.availableShowtimes[0]
        });
      }
    }
  }

  cancelCreate(): void {
    this.isCreateModalVisible = false;
  }

  submitCreate(): void {
    if (this.createForm.invalid) return;

    const formData = this.createForm.value;
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      console.error('User not logged in');
      return;
    }

    const newTicket: Ticket = {
      id: Math.random().toString(36).substring(2, 15),
      userId: currentUser.id,
      movieId: formData.movieId,
      cinemaId: formData.cinemaId,
      showTime: formData.showTime,
      numberOfSeats: formData.numberOfSeats,
      totalPrice: formData.numberOfSeats * 7.99,
      bookingDate: new Date().toISOString(),
      status: formData.status,
    };

    this.ticketService.bookTicket(newTicket).subscribe({
      next: (createdTicket) => {
        if (createdTicket) {
          this.loadTickets(); 
        }
        this.isCreateModalVisible = false;
      },
      error: (err) => {
        console.error('Failed to create ticket:', err);
      },
    });
  }

  onSearch(): void {
    if (!this.searchText) {
      this.filteredTickets = [...this.tickets];
      return;
    }
    
    const searchTerm = this.searchText.toLowerCase().trim();
    this.filteredTickets = this.tickets.filter(ticket => 
      ticket.ticket.id.toLowerCase().includes(searchTerm) ||
      ticket.movie.title.toLowerCase().includes(searchTerm) ||
      ticket.cinema.name.toLowerCase().includes(searchTerm) ||
      ticket.ticket.showTime.toLowerCase().includes(searchTerm) ||
      ticket.ticket.status.toLowerCase().includes(searchTerm)
    );
  }

  currentPageDataChange(data: readonly TicketResponse[]): void {
    console.log('Current page data:', data);
  }
}
