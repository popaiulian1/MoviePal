package com.moviepal_api.Models;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "cinemas")
public class Cinema {
    @Id
    private String id;

    @NotBlank(message = "Cinema name is required")
    @Indexed(unique = true)
    private String name;

    @NotBlank(message = "Location is required")
    @Indexed()
    private String location;

    @Pattern(regexp = "^[0-9\\-\\+\\s()]*$", message = "Invalid phone number format")
    private String contactNumber;
    
    @Email(message = "Invalid email format")
    private String email;
    
    @Pattern(regexp = "^(https?:\\/\\/)?([\\w\\-])+\\.([\\w\\-\\.]+)(\\/[\\w-\\./\\?%&=]*)?$", 
             message = "Invalid website URL format")
    private String website;
    
    private String openingHours;
}
