package com.moviepal_api.Utils;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

@Documented
@Constraint(validatedBy = CinemaExistsValidator.class)
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidCinema {
    String message() default "Cinema does not exist";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}