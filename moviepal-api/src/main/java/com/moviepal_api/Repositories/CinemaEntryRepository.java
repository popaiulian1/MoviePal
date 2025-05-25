package com.moviepal_api.Repositories;

import com.moviepal_api.Models.CinemaEntry;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface CinemaEntryRepository extends MongoRepository<CinemaEntry, String> {
    List<CinemaEntry> findByTitleContainingIgnoreCase(String title);
    List<CinemaEntry> findByGenreContainingIgnoreCase(String genre);
    List<CinemaEntry> findByDirectorContainingIgnoreCase(String director);
}
