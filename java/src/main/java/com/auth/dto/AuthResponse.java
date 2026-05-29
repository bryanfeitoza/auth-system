package com.auth.dto;

import com.auth.model.User;
import java.time.LocalDateTime;
import java.util.UUID;

public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private LocalDateTime expiresAt;
    private UserDTO user;

    public AuthResponse(String accessToken, String refreshToken, LocalDateTime expiresAt, User user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresAt = expiresAt;
        this.user = new UserDTO(user);
    }

    public String getAccessToken() { return accessToken; }
    public String getRefreshToken() { return refreshToken; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public UserDTO getUser() { return user; }

    public static class UserDTO {
        private UUID id;
        private String name;
        private String email;
        private String phone;
        private String avatar;

        public UserDTO(User user) {
            this.id = user.getId();
            this.name = user.getName();
            this.email = user.getEmail();
            this.phone = user.getPhone();
            this.avatar = user.getAvatar();
        }

        public UUID getId() { return id; }
        public String getName() { return name; }
        public String getEmail() { return email; }
        public String getPhone() { return phone; }
        public String getAvatar() { return avatar; }
    }
}
