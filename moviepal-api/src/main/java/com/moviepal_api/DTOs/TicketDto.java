package com.moviepal_api.DTOs;

import com.moviepal_api.Models.Cinema;
import com.moviepal_api.Models.CinemaEntry;
import com.moviepal_api.Models.Ticket;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TicketDto {
    private Ticket ticket;
    private Cinema cinema;
    private CinemaEntry movie;
}
