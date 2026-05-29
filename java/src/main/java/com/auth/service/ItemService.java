package com.auth.service;

import com.auth.dto.ItemRequest;
import com.auth.dto.ItemResponse;
import com.auth.dto.MessageResponse;
import com.auth.dto.PaginatedResponse;
import com.auth.model.Item;
import com.auth.model.User;
import com.auth.repository.ItemRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ItemService {

    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    public PaginatedResponse<ItemResponse> listItems(UUID userId, int page, int limit) {
        PageRequest pageable = PageRequest.of(page - 1, Math.min(limit, 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Item> result = itemRepository.findByUserId(userId, pageable);

        return new PaginatedResponse<>(
                result.getContent().stream().map(ItemResponse::new).collect(Collectors.toList()),
                result.getTotalElements(),
                page,
                result.getTotalPages()
        );
    }

    @Transactional
    public ItemResponse createItem(ItemRequest req, User user) {
        Item item = new Item();
        item.setUser(user);
        item.setTitle(req.getTitle());
        item.setDescription(req.getDescription());
        item.setStatus(req.getStatus() != null ? req.getStatus() : "pending");
        item = itemRepository.save(item);
        return new ItemResponse(item);
    }

    public ItemResponse getItem(UUID id, UUID userId) {
        Item item = itemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Item não encontrado"));
        return new ItemResponse(item);
    }

    @Transactional
    public ItemResponse updateItem(UUID id, ItemRequest req, UUID userId) {
        Item item = itemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Item não encontrado"));

        if (req.getTitle() != null) item.setTitle(req.getTitle());
        if (req.getDescription() != null) item.setDescription(req.getDescription());
        if (req.getStatus() != null) item.setStatus(req.getStatus());

        item = itemRepository.save(item);
        return new ItemResponse(item);
    }

    @Transactional
    public MessageResponse deleteItem(UUID id, UUID userId) {
        Item item = itemRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Item não encontrado"));
        itemRepository.delete(item);
        return new MessageResponse("Item removido com sucesso");
    }
}
