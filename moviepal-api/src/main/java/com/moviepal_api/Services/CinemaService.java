package com.moviepal_api.Services;

import com.moviepal_api.Models.Cinema;
import com.moviepal_api.Repositories.CinemaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CinemaService {

    private final CinemaRepository cinemaRepository;

    public CinemaService(CinemaRepository cinemaRepository) {
        this.cinemaRepository = cinemaRepository;
    }

    public Page<Cinema> findAll(int page, int size, String sortBy) {
        return cinemaRepository.findAll(
                PageRequest.of(page, size, Sort.by(sortBy).ascending())
        );
    }

    public List<Cinema> findAll() {
        return cinemaRepository.findAll();
    }

    public Optional<Cinema> findById(String id) {
        return cinemaRepository.findById(id);
    }

    public Cinema save(Cinema cinema) {
        return cinemaRepository.save(cinema);
    }

    public void deleteById(String id) {
        cinemaRepository.deleteById(id);
    }

    public boolean existsById(String id) {
        return cinemaRepository.existsById(id);
    }

    public List<Cinema> findByNameContaining(String name) {
        return cinemaRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Cinema> findByLocationContaining(String location) {
        return cinemaRepository.findByLocationContainingIgnoreCase(location);
    }
}