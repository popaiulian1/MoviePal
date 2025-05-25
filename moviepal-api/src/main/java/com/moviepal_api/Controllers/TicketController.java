package com.moviepal_api.Controllers;

import com.moviepal_api.DTOs.TicketDto;
import com.moviepal_api.Models.Ticket;
import com.moviepal_api.Services.TicketService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {
    private final TicketService ticketService;
    private static final Logger logger = LoggerFactory.getLogger(TicketController.class);

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@Valid @RequestBody Ticket ticket) {
        try {
            // Get the current authenticated user
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth.getName();
            
            logger.info("Creating ticket for user: {}", userId);
            logger.info("Ticket data: {}", ticket);
            
            // Set the user ID explicitly
            ticket.setUserId(userId);
            
            Ticket createdTicket = ticketService.createTicket(ticket);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdTicket);
        } catch (Exception e) {
            logger.error("Error creating ticket", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body((Ticket) Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<TicketDto>> getUserTickets() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userId = auth.getName();
        
        logger.info("Getting tickets for user: {}", userId);
        
        List<TicketDto> tickets = ticketService.getTicketDetailsForUser(userId);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(@PathVariable String id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth.getName();
            
            logger.info("Getting ticket {} for user: {}", id, userId);
            
            return ticketService.getTicketDetailsById(id)
                    .map(ticketDetails -> {
                        if (ticketDetails.getTicket().getUserId().equals(userId)) {
                            return ResponseEntity.ok(ticketDetails);
                        } else {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "You do not have permission to view this ticket"));
                        }
                    })
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Ticket not found")));
        } catch (Exception e) {
            logger.error("Error getting ticket", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTicket(@PathVariable String id, @Valid @RequestBody Ticket ticket) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth.getName();
            
            logger.info("Updating ticket {} for user: {}", id, userId);
            
            return ticketService.getTicketById(id)
                    .map(existingTicket -> {
                        if (existingTicket.getUserId().equals(userId)) {
                            return ticketService.updateTicket(id, ticket)
                                    .map(ResponseEntity::ok)
                                    .orElse(ResponseEntity.notFound().build());
                        } else {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "You do not have permission to update this ticket"));
                        }
                    })
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Ticket not found")));
        } catch (Exception e) {
            logger.error("Error updating ticket", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTicket(@PathVariable String id) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String userId = auth.getName();
            
            logger.info("Deleting ticket {} for user: {}", id, userId);
            
            return ticketService.getTicketById(id)
                    .map(existingTicket -> {
                        if (existingTicket.getUserId().equals(userId)) {
                            ticketService.deleteTicket(id);
                            return ResponseEntity.noContent().build();
                        } else {
                            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "You do not have permission to delete this ticket"));
                        }
                    })
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Ticket not found")));
        } catch (Exception e) {
            logger.error("Error deleting ticket", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", e.getMessage()));
        }
    }

}
