package com.moviepal_api.Services;

import com.moviepal_api.DTOs.CinemaEntryDetailsDto;
import com.moviepal_api.Models.Cinema;
import com.moviepal_api.Models.CinemaEntry;
import com.moviepal_api.Repositories.CinemaEntryRepository;
import com.moviepal_api.Repositories.CinemaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CinemaEntryService {

    private final CinemaEntryRepository repository;
    private final CinemaRepository cinemaRepository;

    public CinemaEntryService(CinemaEntryRepository repository, CinemaRepository cinemaRepository) {
        this.repository = repository;
        this.cinemaRepository = cinemaRepository;
    }

    public List<CinemaEntry> search(String query) {
        return repository.findByTitleContainingIgnoreCase(query);
    }

    public List<CinemaEntry> findAll() {
        return repository.findAll();
    }

    public Optional<CinemaEntry> findById(String id) {
        return repository.findById(id);
    }

    public CinemaEntry create(CinemaEntry entry) {
        return repository.save(entry);
    }

    public CinemaEntry update(String id, CinemaEntry entry) {
        entry.setId(id);
        return repository.save(entry);
    }

    public void delete(String id) {
        repository.deleteById(id);
    }

    public Page<CinemaEntry> findAll(int page, int size, String sortBy) {
        return repository.findAll(
                PageRequest.of(page, size, Sort.by(sortBy).ascending())
        );
    }

    public Optional<CinemaEntryDetailsDto> findEntryWithCinemaDetails(String id) {
        Optional<CinemaEntry> entryOpt = repository.findById(id);

        if (entryOpt.isPresent()) {
            CinemaEntry entry = entryOpt.get();
            Optional<Cinema> cinemaOpt = cinemaRepository.findById(entry.getCinemaId());

            Cinema cinema = cinemaOpt.orElse(null);
            return Optional.of(new CinemaEntryDetailsDto(entry, cinema));
        }

        return Optional.empty();
    }

    public Page<CinemaEntryDetailsDto> findAllWithCinemaDetails(int page, int size, String sortBy) {
        Page<CinemaEntry> entries = repository.findAll(
                PageRequest.of(page, size, Sort.by(sortBy).ascending())
        );

        // Extract all cinema IDs
        List<String> cinemaIds = entries.getContent().stream()
                .map(CinemaEntry::getCinemaId)
                .collect(Collectors.toList());

        // Fetch all relevant cinemas in one query
        List<Cinema> cinemas = cinemaRepository.findAllById(cinemaIds);

        // Create a map for quick lookup
        Map<String, Cinema> cinemaMap = cinemas.stream()
                .collect(Collectors.toMap(Cinema::getId, cinema -> cinema));

        // Create DTOs combining entries with their cinemas
        List<CinemaEntryDetailsDto> dtos = entries.getContent().stream()
                .map(entry -> {
                    Cinema cinema = cinemaMap.get(entry.getCinemaId());
                    return new CinemaEntryDetailsDto(entry, cinema);
                })
                .collect(Collectors.toList());

        return new PageImpl<>(dtos, PageRequest.of(page, size), entries.getTotalElements());
    }

}
