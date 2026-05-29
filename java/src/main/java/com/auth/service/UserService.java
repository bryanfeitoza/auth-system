package com.auth.service;

import com.auth.dto.*;
import com.auth.model.User;
import com.auth.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                       JwtService jwtService, RefreshTokenService refreshTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email já cadastrado");
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setPhone(req.getPhone());
        user = userRepository.save(user);

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Credenciais inválidas"));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Credenciais inválidas");
        }

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest req) {
        RefreshTokenService.TokenPair pair = new RefreshTokenService.TokenPair(req.getRefreshToken(), null);

        var matched = refreshTokenService.validateAndRevoke(req.getRefreshToken());
        if (matched == null) {
            throw new RuntimeException("Refresh token inválido ou expirado");
        }

        User user = userRepository.findById(matched.getUser().getId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        return buildAuthResponse(user);
    }

    @Transactional
    public void logout(String refreshToken, String userId) {
        User user = userRepository.findById(java.util.UUID.fromString(userId))
                .orElse(null);
        if (user != null && refreshToken != null) {
            refreshTokenService.revokeUserToken(refreshToken, user);
        }
    }

    public User getMe(String userId) {
        return userRepository.findById(java.util.UUID.fromString(userId))
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    @Transactional
    public User updateProfile(String userId, UpdateProfileRequest req) {
        User user = getMe(userId);
        if (req.getName() != null) user.setName(req.getName());
        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getAvatar() != null) user.setAvatar(req.getAvatar());
        return userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user.getId().toString(), user.getEmail());
        var tokenPair = refreshTokenService.createToken(user);
        return new AuthResponse(accessToken, tokenPair.rawToken(), tokenPair.expiresAt(), user);
    }
}
