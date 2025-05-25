package com.moviepal_api.Utils;

import com.moviepal_api.Repositories.CinemaRepository;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.beans.factory.annotation.Autowired;

public class CinemaExistsValidator implements ConstraintValidator<ValidCinema, String> {

    @Autowired
    private CinemaRepository cinemaRepository;

    @Override
    public boolean isValid(String cinemaId, ConstraintValidatorContext context) {
        if (cinemaId == null) {
            return true; // Let @NotNull handle null validation
        }
        return cinemaRepository.existsById(cinemaId);
    }
}