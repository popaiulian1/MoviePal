package com.moviepal_api.Controllers;

import com.moviepal_api.DTOs.CinemaEntryDetailsDto;
import com.moviepal_api.Models.CinemaEntry;
import java.util.List;

import com.moviepal_api.Services.CinemaEntryService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/movies")
public class CinemaEntryController {
    private final CinemaEntryService cinemaEntryService;

    public CinemaEntryController(CinemaEntryService cinemaEntryService) {
        this.cinemaEntryService = cinemaEntryService;
    }

    @GetMapping
    public ResponseEntity<?> getAllEntries(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sort,
            @RequestParam(defaultValue = "false") boolean includeCinemaDetails) {

        if (includeCinemaDetails) {
            Page<CinemaEntryDetailsDto> entriesWithDetails =
                    cinemaEntryService.findAllWithCinemaDetails(page, size, sort);
            return ResponseEntity.ok(entriesWithDetails);
        } else {
            Page<CinemaEntry> entries = cinemaEntryService.findAll(page, size, sort);
            return ResponseEntity.ok(entries);
        }
    }

    @GetMapping("/featured")
    public ResponseEntity<Page<CinemaEntry>> getFeaturedMovies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sort) {
        
        Page<CinemaEntry> featuredMovies = cinemaEntryService.findFeaturedMovies(page, size, sort);
        return ResponseEntity.ok(featuredMovies);
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<CinemaEntryDetailsDto> getEntryWithDetails(@PathVariable String id) {
        return cinemaEntryService.findEntryWithCinemaDetails(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public List<CinemaEntry> search(@RequestParam String query) {
        return cinemaEntryService.search(query);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CinemaEntry> getById(@PathVariable String id) {
        return cinemaEntryService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<CinemaEntry> addEntry(@Valid @RequestBody CinemaEntry cinemaEntry) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cinemaEntryService.create(cinemaEntry));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CinemaEntry> updateEntry(@PathVariable String id, @Valid @RequestBody CinemaEntry cinemaEntry) {
        return ResponseEntity.ok(cinemaEntryService.update(id, cinemaEntry));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEntry(@PathVariable String id) {
        cinemaEntryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
