package com.moviepal_api.Controllers;

import com.moviepal_api.Models.Cinema;
import com.moviepal_api.Repositories.CinemaRepository;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cinemas")
public class CinemaController {

    private final CinemaRepository cinemaRepository;

    public CinemaController(CinemaRepository cinemaRepository) {
        this.cinemaRepository = cinemaRepository;
    }

    @GetMapping
    public ResponseEntity<Page<Cinema>> getAllCinemas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sort) {
        
        Page<Cinema> cinemas = cinemaRepository.findAll(
                PageRequest.of(page, size, Sort.by(sort).ascending()));
        return ResponseEntity.ok(cinemas);
    }

    @GetMapping("/search")
    public List<Cinema> searchCinemas(
            @RequestParam(required = false) String name, 
            @RequestParam(required = false) String location) {
        
        if (name != null) {
            return cinemaRepository.findByNameContainingIgnoreCase(name);
        } else if (location != null) {
            return cinemaRepository.findByLocationContainingIgnoreCase(location);
        }
        
        return cinemaRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Cinema> getCinemaById(@PathVariable String id) {
        return cinemaRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Cinema> createCinema(@Valid @RequestBody Cinema cinema) {
        Cinema saved = cinemaRepository.save(cinema);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cinema> updateCinema(@PathVariable String id, @Valid @RequestBody Cinema cinema) {
        if (!cinemaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        cinema.setId(id);
        return ResponseEntity.ok(cinemaRepository.save(cinema));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCinema(@PathVariable String id) {
        if (!cinemaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        cinemaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}