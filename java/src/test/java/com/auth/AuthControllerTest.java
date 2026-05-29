package com.auth;

import com.auth.dto.RegisterRequest;
import com.auth.dto.LoginRequest;
import com.auth.dto.RefreshRequest;
import com.auth.model.User;
import com.auth.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    void shouldRegisterUser() throws Exception {
        var req = new RegisterRequest();
        req.setName("Test User");
        req.setEmail("test@test.com");
        req.setPassword("123456");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists())
                .andExpect(jsonPath("$.user.email").value("test@test.com"));
    }

    @Test
    void shouldRejectDuplicateEmail() throws Exception {
        User user = new User();
        user.setName("Existing");
        user.setEmail("dup@test.com");
        user.setPassword(passwordEncoder.encode("123456"));
        userRepository.save(user);

        var req = new RegisterRequest();
        req.setName("Test");
        req.setEmail("dup@test.com");
        req.setPassword("123456");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isConflict());
    }

    @Test
    void shouldLogin() throws Exception {
        User user = new User();
        user.setName("Test");
        user.setEmail("login@test.com");
        user.setPassword(passwordEncoder.encode("123456"));
        userRepository.save(user);

        var req = new LoginRequest();
        req.setEmail("login@test.com");
        req.setPassword("123456");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists());
    }

    @Test
    void shouldRejectInvalidLogin() throws Exception {
        var req = new LoginRequest();
        req.setEmail("none@test.com");
        req.setPassword("wrong");

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRefreshToken() throws Exception {
        User user = new User();
        user.setName("Test");
        user.setEmail("refresh@test.com");
        user.setPassword(passwordEncoder.encode("123456"));
        userRepository.save(user);

        var loginReq = new LoginRequest();
        loginReq.setEmail("refresh@test.com");
        loginReq.setPassword("123456");

        String loginRes = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andReturn().getResponse().getContentAsString();

        var refreshToken = objectMapper.readTree(loginRes).get("refreshToken").asText();

        var refreshReq = new RefreshRequest();
        refreshReq.setRefreshToken(refreshToken);

        mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists());
    }

    @Test
    void shouldAccessMe() throws Exception {
        User user = new User();
        user.setName("Test Me");
        user.setEmail("me@test.com");
        user.setPassword(passwordEncoder.encode("123456"));
        userRepository.save(user);

        var loginReq = new LoginRequest();
        loginReq.setEmail("me@test.com");
        loginReq.setPassword("123456");

        String loginRes = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq)))
                .andReturn().getResponse().getContentAsString();

        var accessToken = objectMapper.readTree(loginRes).get("accessToken").asText();

        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("me@test.com"));
    }
}
