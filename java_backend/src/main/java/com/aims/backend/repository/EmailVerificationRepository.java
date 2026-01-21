package com.aims.backend.repository;

import com.aims.backend.domain.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailVerificationRepository
        extends JpaRepository<EmailVerification, String> {
}
