package com.aims.backend.security;

import com.aims.backend.domain.User;
import com.aims.backend.repository.UserRepository;
import org.springframework.stereotype.Component;

@Component
public class CurrentUserProvider {

    private final UserRepository userRepository;

    public CurrentUserProvider(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        // TEMPORARY: hardcoded "alice"
        return userRepository.findByUsername("Dr. Neeraj Goel")
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
