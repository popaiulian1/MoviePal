package com.moviepal_api.Services;

import com.moviepal_api.Repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import com.moviepal_api.Models.User;
import com.moviepal_api.Utils.EmailUtil;
import java.util.Optional;

@Service
public class UserService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository){
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public User register(User user) throws Exception{
        logger.info("Registering user: {}", user.getUsername());

        if (user.getUsername() == null || user.getUsername().isEmpty()) {
            throw new Exception("Username is required");
        }

        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            logger.warn("Registration failed: Username {} already exists", user.getUsername());
            throw new Exception("Username already exists");
        }

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            logger.warn("Registration failed: Email {} already exists", user.getEmail());
            throw new Exception("Email already exists");
        }

        // Default role -> user
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            user.setRoles(java.util.Collections.singletonList("USER"));
        }

        // Hashing password nu uita sa scoti de la to do dupa.
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        logger.info("User registered successfully: {}", user.getUsername());

        return userRepository.save(user);
    }

    public Optional<User> login(String loginMethod, String password) {
        Optional<User> user;

        logger.info("Login attempt with: {}", loginMethod);

        if(EmailUtil.checkIfEmail(loginMethod)) {
            logger.debug("Attempting login with email");
            user = userRepository.findByEmail(loginMethod);
        }else{
            logger.debug("Attempting login with username");
            user = userRepository.findByUsername(loginMethod);
        }

        if (user.isPresent()) {
            logger.debug("User found: {}", user.get().getUsername());
            boolean passwordMatches = passwordEncoder.matches(password, user.get().getPassword());

            if(passwordMatches) {
                logger.info("Login successful for user: {}", user.get().getUsername());
                return user;
            } else {
                logger.warn("Password does not match for user: {}", user.get().getUsername());
            }
        }
        else {
            logger.warn("User not found: {}", loginMethod);
        }
        return Optional.empty();
    }

    public Optional<User> findByUsername(String username) {
        logger.debug("Finding user by username: {}", username);
        return userRepository.findByUsername(username);
    }
}
