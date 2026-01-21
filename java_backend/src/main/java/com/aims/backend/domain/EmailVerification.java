package com.aims.backend.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "email_verifications")
public class EmailVerification {

    @Id
    private String email;

    @Column(nullable = false)
    private String otpHash;

    @Column(nullable = false)
    private Instant expiresAt;

    protected EmailVerification() {}

    public EmailVerification(String email, String otpHash, Instant expiresAt) {
        this.email = email;
        this.otpHash = otpHash;
        this.expiresAt = expiresAt;
    }

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public String getOtpHash() {
        return otpHash;
    }
}
