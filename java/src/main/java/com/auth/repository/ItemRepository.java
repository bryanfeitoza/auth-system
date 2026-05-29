package com.auth.repository;

import com.auth.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ItemRepository extends JpaRepository<Item, UUID> {
    List<Item> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<Item> findByIdAndUserId(UUID id, UUID userId);
}
