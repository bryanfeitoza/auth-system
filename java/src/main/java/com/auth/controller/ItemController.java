package com.auth.controller;

import com.auth.dto.*;
import com.auth.model.User;
import com.auth.repository.UserRepository;
import com.auth.service.ItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemService itemService;
    private final UserRepository userRepository;

    public ItemController(ItemService itemService, UserRepository userRepository) {
        this.itemService = itemService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<PaginatedResponse<ItemResponse>> listItems(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getDetails());
        return ResponseEntity.ok(itemService.listItems(userId, page, limit));
    }

    @PostMapping
    public ResponseEntity<?> createItem(@RequestBody ItemRequest req, Authentication auth) {
        UUID userId = UUID.fromString((String) auth.getDetails());
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse("Usuário não encontrado"));
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(itemService.createItem(req, user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getItem(@PathVariable UUID id, Authentication auth) {
        try {
            UUID userId = UUID.fromString((String) auth.getDetails());
            return ResponseEntity.ok(itemService.getItem(id, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateItem(@PathVariable UUID id, @RequestBody ItemRequest req, Authentication auth) {
        try {
            UUID userId = UUID.fromString((String) auth.getDetails());
            return ResponseEntity.ok(itemService.updateItem(id, req, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItem(@PathVariable UUID id, Authentication auth) {
        try {
            UUID userId = UUID.fromString((String) auth.getDetails());
            return ResponseEntity.ok(itemService.deleteItem(id, userId));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse(e.getMessage()));
        }
    }
}
