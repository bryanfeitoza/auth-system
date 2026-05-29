package com.auth.dto;

import com.auth.model.Item;
import java.time.LocalDateTime;
import java.util.UUID;

public class ItemResponse {
    private UUID id;
    private UUID userId;
    private String title;
    private String description;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ItemResponse(Item item) {
        this.id = item.getId();
        this.userId = item.getUser().getId();
        this.title = item.getTitle();
        this.description = item.getDescription();
        this.status = item.getStatus();
        this.createdAt = item.getCreatedAt();
        this.updatedAt = item.getUpdatedAt();
    }

    public UUID getId() { return id; }
    public UUID getUserId() { return userId; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
