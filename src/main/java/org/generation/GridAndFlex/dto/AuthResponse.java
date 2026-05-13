package org.generation.GridAndFlex.dto;

public class AuthResponse {

    private String token;
    private String tokenType;
    private Long expiresInMs;

    public AuthResponse() {
    }

    public AuthResponse(String token, String tokenType, Long expiresInMs) {
        this.token = token;
        this.tokenType = tokenType;
        this.expiresInMs = expiresInMs;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public Long getExpiresInMs() {
        return expiresInMs;
    }

    public void setExpiresInMs(Long expiresInMs) {
        this.expiresInMs = expiresInMs;
    }
}