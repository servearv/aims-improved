package com.aims.backend.service;

import com.aims.backend.domain.Role;
import com.aims.backend.domain.User;
import com.aims.backend.repository.UserRepository;
import com.aims.backend.security.AuthorizationService;
import com.aims.backend.security.CurrentUserProvider;
import org.springframework.stereotype.Service;


@Service
public class AdminService {

    private final UserRepository userRepository;
    private final AuthorizationService authorizationService;
    private final CurrentUserProvider currentUserProvider;

    public AdminService(
            UserRepository userRepository,
            AuthorizationService authorizationService,
            CurrentUserProvider currentUserProvider
    ) {
        this.userRepository = userRepository;
        this.authorizationService = authorizationService;
        this.currentUserProvider = currentUserProvider;
    }

    public User createUser(String email, Role role) {
        var currentUser = currentUserProvider.getCurrentUser();

        // ONLY ADMIN
        authorizationService.requireRole(currentUser, Role.ADMIN);

        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        return userRepository.save(new User(email, role));
    }
}
