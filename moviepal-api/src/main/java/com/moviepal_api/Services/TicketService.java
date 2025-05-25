package com.moviepal_api.Services;

import com.moviepal_api.DTOs.TicketDto;
import com.moviepal_api.Models.Cinema;
import com.moviepal_api.Models.CinemaEntry;
import com.moviepal_api.Models.Ticket;
import com.moviepal_api.Repositories.CinemaEntryRepository;
import com.moviepal_api.Repositories.CinemaRepository;
import com.moviepal_api.Repositories.TicketRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class TicketService {
    private final TicketRepository ticketRepository;
    private final CinemaEntryRepository cinemaEntryRepository;
    private final CinemaRepository cinemaRepository;
    private static final Logger logger = LoggerFactory.getLogger(TicketService.class);

    public TicketService(TicketRepository ticketRepository, CinemaEntryRepository cinemaEntryRepository, CinemaRepository cinemaRepository) {
        this.ticketRepository = ticketRepository;
        this.cinemaEntryRepository = cinemaEntryRepository;
        this.cinemaRepository = cinemaRepository;

    }

    public Ticket createTicket(Ticket ticket) {

        if (ticket.getUserId() == null || ticket.getUserId().isEmpty()) {
            throw new IllegalArgumentException("User ID must be provided");
        }
        
        if (ticket.getMovieId() == null || ticket.getMovieId().isEmpty()) {
            throw new IllegalArgumentException("Movie ID must be provided");
        }
        
        if (ticket.getCinemaId() == null || ticket.getCinemaId().isEmpty()) {
            throw new IllegalArgumentException("Cinema ID must be provided");
        }
        
        if (ticket.getShowTime() == null || ticket.getShowTime().isEmpty()) {
            throw new IllegalArgumentException("Show time must be provided");
        }
        
        if (ticket.getNumberOfSeats() < 1) {
            throw new IllegalArgumentException("At least one seat must be selected");
        }
        
        // Set booking date to current time
        ticket.setBookingDate(LocalDateTime.now());
        
        // Set default status if not provided
        if (ticket.getStatus() == null || ticket.getStatus().isEmpty()) {
            ticket.setStatus("BOOKED");
        }
        
        // Calculate total price based on movie price and number of seats
        Optional<CinemaEntry> movie = cinemaEntryRepository.findById(ticket.getMovieId());
        if (movie.isPresent() && movie.get().getTicketPrice() != null) {
            try {
                double ticketPrice = Double.parseDouble(movie.get().getTicketPrice());
                ticket.setTotalPrice(ticketPrice * ticket.getNumberOfSeats());
            } catch (NumberFormatException e) {
                // Default price if parsing fails
                ticket.setTotalPrice(10.0 * ticket.getNumberOfSeats());
            }
        } else {
            // Default price if movie not found or no price set
            ticket.setTotalPrice(10.0 * ticket.getNumberOfSeats());
        }
        
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getTicketsByUserId(String userId){
        return ticketRepository.findByUserId(userId);
    }

    public Optional<Ticket> getTicketById(String ticketId){
        return ticketRepository.findById(ticketId);
    }

    public List<TicketDto> getTicketDetailsForUser(String userId){
        List<Ticket> tickets = ticketRepository.findByUserId(userId);
        logger.info("Found {} tickets for user {}", tickets.size(), userId);
        List<TicketDto> ticketDtos = new ArrayList<>();

        for (Ticket ticket : tickets) {
            logger.info("Processing ticket: {}", ticket.getId());
            Optional<CinemaEntry> movie = cinemaEntryRepository.findById(ticket.getMovieId());
            Optional<Cinema> cinema = cinemaRepository.findById(ticket.getCinemaId());

            if(!movie.isPresent()) {
                logger.warn("Movie not found for ticket {}: movieId={}", ticket.getId(), ticket.getMovieId());
            }
            
            if(!cinema.isPresent()) {
                logger.warn("Cinema not found for ticket {}: cinemaId={}", ticket.getId(), ticket.getCinemaId());
            }

            // Create DTO even if movie or cinema is missing
            CinemaEntry movieData = movie.orElse(createPlaceholderMovie(ticket.getMovieId()));
            Cinema cinemaData = cinema.orElse(createPlaceholderCinema(ticket.getCinemaId()));
            
            ticketDtos.add(new TicketDto(ticket, cinemaData, movieData));
            logger.info("Added ticket to response: {}", ticket.getId());
        }

        return ticketDtos;
    }

    // Create placeholder objects for missing data
    private CinemaEntry createPlaceholderMovie(String movieId) {
        CinemaEntry placeholder = new CinemaEntry();
        placeholder.setId(movieId);
        placeholder.setTitle("Unknown Movie");
        placeholder.setTicketPrice("0.00");
        return placeholder;
    }

    private Cinema createPlaceholderCinema(String cinemaId) {
        Cinema placeholder = new Cinema();
        placeholder.setId(cinemaId);
        placeholder.setName("Unknown Cinema");
        placeholder.setLocation("Unknown Location");
        return placeholder;
    }

    public Optional<TicketDto> getTicketDetailsById(String ticketId){
        Optional<Ticket> ticket = ticketRepository.findById(ticketId);

        if(ticket.isPresent()){
            Optional<CinemaEntry> movie = cinemaEntryRepository.findById(ticket.get().getMovieId());
            Optional<Cinema> cinema = cinemaRepository.findById(ticket.get().getCinemaId());

            if(movie.isPresent() && cinema.isPresent()){
                return Optional.of(new TicketDto(ticket.get(), cinema.get(), movie.get()));
            }
        }

        return Optional.empty();
    }

    public Optional<Ticket> updateTicket(String id, Ticket updatedTicket){
        return ticketRepository.findById(id).map(
                ticket -> {
                    if(updatedTicket.getStatus() != null){
                        ticket.setStatus(updatedTicket.getStatus());
                    }
                    if(updatedTicket.getNumberOfSeats() > 0){
                        ticket.setNumberOfSeats(updatedTicket.getNumberOfSeats());

                        Optional<CinemaEntry> movie = cinemaEntryRepository.findById(ticket.getMovieId());
                        if(movie.isPresent()){
                            double ticketPrice = Double.parseDouble(movie.get().getTicketPrice());
                            ticket.setTotalPrice(ticketPrice * ticket.getNumberOfSeats());
                        }
                    }
                    return ticketRepository.save(ticket);
                }
        );
    }

    public void deleteTicket(String id){
        ticketRepository.deleteById(id);
    }
}
