package dev.dept.pe.security;

import dev.dept.pe.model.User;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenService {

    private static final String SECRET_KEY = "pe-management-portal-secure-token-secret-key-2026";
    private static final long EXPIRATION_MILLIS = 7 * 24 * 60 * 60 * 1000L; // 7 days

    // Active session cache for fast lookup and stateful invalidation if needed
    private final Map<String, UserSession> activeTokens = new ConcurrentHashMap<>();

    public String generateToken(User user) {
        long expiry = System.currentTimeMillis() + EXPIRATION_MILLIS;
        String role = user.getRole() != null ? user.getRole().toUpperCase() : "STUDENT";
        String payload = user.getUserId() + ":" + role + ":" + user.getEmail() + ":" + (user.getRegisterNo() != null ? user.getRegisterNo() : "") + ":" + expiry;
        String signature = computeSignature(payload);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString((payload + ":" + signature).getBytes(StandardCharsets.UTF_8));

        UserSession session = new UserSession(
                user.getUserId(),
                user.getUsername() != null ? user.getUsername() : user.getName(),
                user.getEmail(),
                role,
                user.getRegisterNo()
        );
        activeTokens.put(token, session);
        return token;
    }

    public UserSession validateToken(String token) {
        if (token == null || token.trim().isEmpty()) {
            return null;
        }

        // Clean bearer prefix if present
        if (token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        }

        // First check memory cache
        UserSession cached = activeTokens.get(token);
        if (cached != null) {
            return cached;
        }

        try {
            byte[] decoded = Base64.getUrlDecoder().decode(token);
            String tokenStr = new String(decoded, StandardCharsets.UTF_8);
            String[] parts = tokenStr.split(":");
            if (parts.length != 6) {
                return null;
            }

            Long userId = Long.parseLong(parts[0]);
            String role = parts[1];
            String email = parts[2];
            String registerNo = parts[3];
            long expiry = Long.parseLong(parts[4]);
            String signature = parts[5];

            if (System.currentTimeMillis() > expiry) {
                return null; // Expired
            }

            String payload = userId + ":" + role + ":" + email + ":" + registerNo + ":" + expiry;
            String expectedSignature = computeSignature(payload);

            if (MessageDigest.isEqual(signature.getBytes(StandardCharsets.UTF_8), expectedSignature.getBytes(StandardCharsets.UTF_8))) {
                UserSession session = new UserSession(userId, email, email, role, registerNo);
                activeTokens.put(token, session);
                return session;
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    public void invalidateToken(String token) {
        if (token != null) {
            if (token.startsWith("Bearer ")) {
                token = token.substring(7).trim();
            }
            activeTokens.remove(token);
        }
    }

    private String computeSignature(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(SECRET_KEY.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(rawHmac);
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate HMAC signature", e);
        }
    }
}
