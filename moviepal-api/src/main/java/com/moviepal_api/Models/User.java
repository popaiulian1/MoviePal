package com.moviepal_api.Models;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;


@Data
@Document(collection="users")
public class User {

    @Id
    private String id;

    @Indexed(unique=true)
    @NotBlank(message = "Username cannot be blank")
    private String username;

    @Indexed(unique=true)
    @NotBlank(message = "Email cannot be blank")
    private String email;

    @NotBlank(message = "Password cannot be blank")
    private String password; // TODO: Remember to hash it!!!!

    private List<String> roles = new ArrayList<>();
}
