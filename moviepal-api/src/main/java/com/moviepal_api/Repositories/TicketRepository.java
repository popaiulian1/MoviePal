package com.moviepal_api.Repositories;


import com.moviepal_api.Models.Ticket;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface TicketRepository extends MongoRepository<Ticket, String> {
    List<Ticket> findByMovieId(String movieId);
    List<Ticket> findByUserId(String userId);
    List<Ticket> findByCinemaId(String cinemaId);
}
