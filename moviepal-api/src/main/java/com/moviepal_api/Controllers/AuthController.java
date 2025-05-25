package com.moviepal_api.Controllers;

import com.moviepal_api.DTOs.UserDto;
import com.moviepal_api.Services.UserService;
import com.moviepal_api.Utils.JwtUtil;
import jakarta.validation.Valid;
import lombok.Data;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.moviepal_api.Models.User;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody User user) {
        try {
            User savedUser = userService.register(user);

            UserDto userDto = new UserDto();
            userDto.setId(savedUser.getId());
            userDto.setUsername(savedUser.getUsername());
            userDto.setEmail(savedUser.getEmail());

            return ResponseEntity.ok(userDto);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        return userService.login(request.getUsername(), request.getPassword())
                .map(user -> {
                    String token = jwtUtil.generateToken(user);
                    return ResponseEntity.ok(new AuthResponse(token));
                }).orElseGet(() -> ResponseEntity.status(401).body(new AuthResponse("Invalid Credentials")));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            String username = jwtUtil.extractUsername(request.getToken());
            if (username != null && jwtUtil.validateToken(request.getToken(), username)) {
                // Generate new token
                return userService.findByUsername(username)
                        .map(user -> {
                            String newToken = jwtUtil.generateToken(user);
                            return ResponseEntity.ok(new AuthResponse(newToken));
                        })
                        .orElse(ResponseEntity.status(401).body(new AuthResponse("Invalid token")));
            }
            return ResponseEntity.status(401).body(new AuthResponse("Invalid token"));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(new AuthResponse("Invalid token"));
        }
    }

    @Data
    static class RefreshTokenRequest {
        private String token;
    }

    @Data
    static class AuthRequest {
        private String username;
        private String password;
    }

    @Data
    static class AuthResponse {
        AuthResponse(String token) {
            this.token = token;
        }

        private final String token;
    }
}





