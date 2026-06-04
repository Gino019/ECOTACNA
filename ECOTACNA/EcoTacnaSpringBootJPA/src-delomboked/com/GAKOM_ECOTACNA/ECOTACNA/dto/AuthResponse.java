package com.GAKOM_ECOTACNA.ECOTACNA.dto;

public class AuthResponse {
    private String token;
    private String email;
    private String role;
    private String companyName;
    private Long companyId;
    private Long userId;

    public AuthResponse() {}

    public AuthResponse(String token, String email, String role, String companyName, Long companyId, Long userId) {
        this.token = token;
        this.email = email;
        this.role = role;
        this.companyName = companyName;
        this.companyId = companyId;
        this.userId = userId;
    }

    public static AuthResponseBuilder builder() {
        return new AuthResponseBuilder();
    }

    public static class AuthResponseBuilder {
        private String token;
        private String email;
        private String role;
        private String companyName;
        private Long companyId;
        private Long userId;

        public AuthResponseBuilder token(String token) { this.token = token; return this; }
        public AuthResponseBuilder email(String email) { this.email = email; return this; }
        public AuthResponseBuilder role(String role) { this.role = role; return this; }
        public AuthResponseBuilder companyName(String companyName) { this.companyName = companyName; return this; }
        public AuthResponseBuilder companyId(Long companyId) { this.companyId = companyId; return this; }
        public AuthResponseBuilder userId(Long userId) { this.userId = userId; return this; }

        public AuthResponse build() {
            return new AuthResponse(token, email, role, companyName, companyId, userId);
        }
    }

    public String getToken() { return token; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getCompanyName() { return companyName; }
    public Long getCompanyId() { return companyId; }
    public Long getUserId() { return userId; }
}
