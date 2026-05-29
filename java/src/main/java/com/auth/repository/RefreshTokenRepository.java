package com.auth.repository;

import com.auth.model.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    List<RefreshToken> findByUserIdAndRevokedFalseOrderByCreatedAtDesc(UUID userId);
    List<RefreshToken> findByRevokedFalseOrderByCreatedAtDesc();
}
