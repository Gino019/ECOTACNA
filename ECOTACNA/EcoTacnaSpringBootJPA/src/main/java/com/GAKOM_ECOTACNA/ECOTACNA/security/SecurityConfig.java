package com.GAKOM_ECOTACNA.ECOTACNA.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(request -> {
                    var corsConfig = new org.springframework.web.cors.CorsConfiguration();
                    String envOrigins = System.getenv("ALLOWED_ORIGINS");
                    if (envOrigins != null && !envOrigins.trim().isEmpty()) {
                        corsConfig.setAllowedOrigins(java.util.Arrays.asList(envOrigins.split(",")));
                    } else {
                        corsConfig.setAllowedOrigins(java.util.List.of("http://localhost:5173", "http://localhost:8081", "http://localhost:3000"));
                    }
                    corsConfig.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                    corsConfig.setAllowedHeaders(java.util.List.of("Authorization", "Content-Type", "Accept"));
                    return corsConfig;
                }))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/health", "/api/health/**").permitAll()
                        .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
                        .requestMatchers("/api/public/plans", "/api/public/ruc/**", "/api/public/checkout/**", "/api/webhooks/culqi").permitAll()
                        .requestMatchers("/", "/index.html", "/dashboard.html", "/css/**", "/js/**").permitAll()

                        .requestMatchers("/api/empresa/**").hasRole("GENERADOR")
                        .requestMatchers("/api/recolector/**").hasRole("RECOLECTOR")
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
