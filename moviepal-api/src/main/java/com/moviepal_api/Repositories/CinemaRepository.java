package com.moviepal_api.Repositories;

import com.moviepal_api.Models.Cinema;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CinemaRepository extends MongoRepository<Cinema, String> {
    List<Cinema> findByNameContainingIgnoreCase(String name);
    List<Cinema> findByLocationContainingIgnoreCase(String location);
 }