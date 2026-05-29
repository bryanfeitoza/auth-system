package com.auth.dto;

import com.auth.model.User;
import java.util.UUID;

public class AuthResponse {

    private String token;
    private UserDTO user;

    public AuthResponse(String token, User user) {
        this.token = token;
        this.user = new UserDTO(user);
    }

    public String getToken() { return token; }
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
