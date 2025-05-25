package com.moviepal_api.Models;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Document(collection = "tickets")
public class Ticket {
    @Id
    private String id;

    @Indexed
    private String userId;

    @NotNull(message = "Movie ID is required")
    @Indexed
    private String movieId;

    @NotNull(message = "Cinema ID is required")
    private String cinemaId;

    @NotNull(message = "Showtime is required")
    private String showTime;

    @Min(value = 1, message = "At least one seat must be selected")
    private int numberOfSeats;

    private double totalPrice;
    private LocalDateTime bookingDate;
    private String status = "BOOKED"; // BOOKED, CANCELED, PAID
}
