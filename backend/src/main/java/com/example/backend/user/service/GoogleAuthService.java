package com.example.backend.user.service;

import com.example.backend.config.JwtTokenProvider;
import com.example.backend.user.entity.Role;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Value("${app.google-client-id}")
    private String googleClientId;


    @Transactional
    public String loginWithGoogle(String idToken) {
        // Xác thực chữ ký + audience — không thể giả mạo
        GoogleIdToken.Payload payload = verifyGoogleToken(idToken);

        String email   = payload.getEmail();
        String picture = (String) payload.get("picture");

        if (email == null || email.isBlank()) {
            throw new RuntimeException("Google ID Token không chứa email hợp lệ!");
        }

        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
        } else {
            user = new User();
            user.setEmail(email);
            user.setAvatarUrl(picture);
            user.setRole(Role.USER);
            user.setUsername(generateUniqueUsername(email.split("@")[0]));
            // Mật khẩu random vì user đăng nhập qua Google, không dùng password
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            userRepository.save(user);
        }

        return jwtTokenProvider.generateToken(user.getUsername(), user.getRole().name());
    }

    private GoogleIdToken.Payload verifyGoogleToken(String idToken) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            )
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken googleIdToken = verifier.verify(idToken);

            if (googleIdToken == null) {
                throw new RuntimeException("Google ID Token không hợp lệ hoặc đã hết hạn!");
            }

            return googleIdToken.getPayload();

        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Không thể xác thực với Google: " + e.getMessage());
        }
    }

    private String generateUniqueUsername(String base) {
        // Sanitize: chỉ giữ chữ và số, tối đa 20 ký tự
        String sanitized = base.replaceAll("[^a-zA-Z0-9]", "");
        if (sanitized.isBlank()) sanitized = "user";
        if (sanitized.length() > 20) sanitized = sanitized.substring(0, 20);

        String username = sanitized;
        int count = 1;

        while (userRepository.findByUsername(username).isPresent()) {
            username = sanitized + count;
            count++;
        }
        return username;
    }
}