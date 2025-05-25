package com.moviepal_api.DTOs;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CinemaDto {
    private String id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    @Pattern(regexp = "^[0-9\\-\\+\\s()]*$", message = "Invalid phone number format")
    private String contactNumber;

    @Email(message = "Invalid email format")
    private String email;

    private String website;
    private String openingHours;
}