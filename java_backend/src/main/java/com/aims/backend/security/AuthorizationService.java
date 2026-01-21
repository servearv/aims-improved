package com.aims.backend.security;

import com.aims.backend.domain.Role;
import com.aims.backend.domain.User;
import org.springframework.stereotype.Service;

@Service
public class AuthorizationService {

    public void requireRole(User user, Role required) {
        if (user.getRole() != required) {
            throw new RuntimeException("Forbidden");
        }
    }

    public void requireAnyRole(User user, Role... allowed) {
        for (Role role : allowed) {
            if (user.getRole() == role) {
                return;
            }
        }
        throw new RuntimeException("Forbidden");
    }
}
