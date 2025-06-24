import { Cinema } from "./cinema.interface";
import { featuredMovie } from "./featured-movie.interface";
import { Ticket } from "./ticket.interface";

export interface TicketResponse {
    ticket: Ticket;
    cinema: Cinema;
    movie: featuredMovie;
}