package com.example.backend.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        // Xem đánh giá (chỉ cho phép GET công khai)
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/products/*/reviews/**").permitAll()
                        // Thêm, sửa, xóa đánh giá (yêu cầu quyền USER hoặc ADMIN)
                        .requestMatchers("/api/products/*/reviews/**").hasAnyAuthority("USER", "ADMIN")
                        // Xem sản phẩm (chỉ cho phép GET công khai)
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/products/**").permitAll()
                        // File ảnh upload công khai
                        .requestMatchers("/uploads/**").permitAll()
                        // Admin
                        .requestMatchers("/api/admin/**").hasAuthority("ADMIN")
                        // Giỏ hàng
                        .requestMatchers("/api/cart/**").hasAnyAuthority("USER", "ADMIN")
                        // Yêu thích
                        .requestMatchers("/api/favorites/**").hasAnyAuthority("USER", "ADMIN")
                       //payment
                        .requestMatchers("/api/payment/vnpay/return").permitAll()
                        .requestMatchers("/api/payment/vnpay/ipn").permitAll()
                        .requestMatchers("/api/payment/**").hasAnyAuthority("USER", "ADMIN")
                        // User routes
                        .requestMatchers("/api/user/**").hasAnyAuthority("USER", "ADMIN")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}