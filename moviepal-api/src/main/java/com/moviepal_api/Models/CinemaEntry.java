package com.moviepal_api.Models;


import com.moviepal_api.Utils.ValidCinema;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "cinema_entries")
public class CinemaEntry {
    @Id
    private String id;

    @NotBlank(message = "Movie title is required")
    @Indexed()
    private String title;

    @NotBlank(message = "Genre is required")
    @Indexed()
    private String genre;

    @NotBlank(message = "Director is required")
    @Indexed()
    private String director;

    @DecimalMin(value = "0.0", message = "Rating must be at least 0")
    @DecimalMax(value = "10.0", message = "Rating cannot exceed 10")
    private Double rating;
    
    private String description;
    
    @Pattern(regexp = "^(https?:\\/\\/)?([\\w\\-])+\\.([\\w\\-\\.]+)(\\/[\\w-\\./\\?%&=]*)?$",
             message = "Invalid poster URL format")
    private String posterUrl;
    
    @Pattern(regexp = "^(https?:\\/\\/)?([\\w\\-])+\\.([\\w\\-\\.]+)(\\/[\\w-\\./\\?%&=]*)?$", 
             message = "Invalid trailer URL format")
    private String trailerUrl;

    @Pattern(regexp = "^\\d{4}-\\d{2}-\\d{2}$", message = "Release date must be in format YYYY-MM-DD")
    @Indexed()
    private String releaseDate;

    private String runtime;
    private String language;
    private String cast;
    private String status;
    private List<String> showTimes;

    @Pattern(regexp = "^\\d+(\\.\\d{1,2})?$", message = "Invalid ticket price format")
    private String ticketPrice;

    @NotNull(message = "Cinema ID is required")
    @ValidCinema(message = "Referenced cinema does not exist")
    @Indexed()
    private String cinemaId;
}
