package com.auth.repository;

import com.auth.model.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ItemRepository extends JpaRepository<Item, UUID> {
    Page<Item> findByUserId(UUID userId, Pageable pageable);
    Optional<Item> findByIdAndUserId(UUID id, UUID userId);
}
