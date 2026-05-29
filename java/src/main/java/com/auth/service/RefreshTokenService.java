package com.auth.service;

import com.auth.model.RefreshToken;
import com.auth.model.User;
import com.auth.repository.RefreshTokenRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    private static final int REFRESH_EXPIRE_DAYS = 7;
    private static final int TOKEN_BYTES = 30;

    public RefreshTokenService(RefreshTokenRepository repository, PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public TokenPair createToken(User user) {
        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        String raw = HexFormat.of().formatHex(bytes);

        RefreshToken rt = new RefreshToken();
        rt.setUser(user);
        rt.setTokenHash(passwordEncoder.encode(raw));
        rt.setExpiresAt(LocalDateTime.now().plusDays(REFRESH_EXPIRE_DAYS));
        rt.setRevoked(false);
        repository.save(rt);

        return new TokenPair(raw, rt.getExpiresAt());
    }

    @Transactional
    public RefreshToken validateAndRevoke(String rawToken) {
        List<RefreshToken> tokens = repository.findByRevokedFalseOrderByCreatedAtDesc();
        LocalDateTime now = LocalDateTime.now();

        for (RefreshToken t : tokens) {
            if (t.getExpiresAt().isBefore(now)) {
                t.setRevoked(true);
                repository.save(t);
                continue;
            }
            if (passwordEncoder.matches(rawToken, t.getTokenHash())) {
                t.setRevoked(true);
                repository.save(t);
                return t;
            }
        }
        return null;
    }

    @Transactional
    public void revokeUserToken(String rawToken, User user) {
        List<RefreshToken> tokens = repository.findByUserIdAndRevokedFalseOrderByCreatedAtDesc(user.getId());
        for (RefreshToken t : tokens) {
            if (passwordEncoder.matches(rawToken, t.getTokenHash())) {
                t.setRevoked(true);
                repository.save(t);
                break;
            }
        }
    }

    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void cleanupExpired() {
        repository.deleteAll(repository.findAll()
                .stream()
                .filter(t -> t.getExpiresAt().isBefore(LocalDateTime.now()) || t.getRevoked())
                .toList());
    }

    public record TokenPair(String rawToken, LocalDateTime expiresAt) {}
}
