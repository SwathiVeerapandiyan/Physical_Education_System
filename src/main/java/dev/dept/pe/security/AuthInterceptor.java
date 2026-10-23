package dev.dept.pe.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final TokenService tokenService;

    @Autowired
    public AuthInterceptor(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        // Allow CORS preflight requests
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI();
        String method = request.getMethod();

        // Whitelisted public paths
        if (isPublicPath(path, method)) {
            // If token is optionally provided on public paths, still bind session
            String token = extractToken(request);
            if (token != null) {
                UserSession session = tokenService.validateToken(token);
                if (session != null) {
                    request.setAttribute("userSession", session);
                }
            }
            return true;
        }

        // Extract token
        String token = extractToken(request);
        if (token == null || token.trim().isEmpty()) {
            writeError(response, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized", "Authentication token is required. Please log in.");
            return false;
        }

        UserSession session = tokenService.validateToken(token);
        if (session == null) {
            writeError(response, HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized", "Invalid or expired session token. Please log in again.");
            return false;
        }

        request.setAttribute("userSession", session);

        // Enforce Admin-only endpoints
        if (isAdminOnlyEndpoint(path, method)) {
            if (!session.isAdmin()) {
                writeError(response, HttpServletResponse.SC_FORBIDDEN, "Forbidden", "Access Denied: Administrator role required to perform this action.");
                return false;
            }
        }

        return true;
    }

    private boolean isPublicPath(String path, String method) {
        if (path.startsWith("/api/auth/login") || path.startsWith("/api/auth/register")) {
            return true;
        }
        if (path.startsWith("/api/notifications/stream") || path.startsWith("/api/notifications/test")) {
            return true;
        }
        if (path.startsWith("/h2-console") || path.startsWith("/error") || path.startsWith("/favicon.ico")) {
            return true;
        }
        // Public read-only catalog info
        if ("GET".equalsIgnoreCase(method)) {
            if (path.startsWith("/api/sports") ||
                path.startsWith("/api/matches") ||
                path.startsWith("/api/live-scores") ||
                path.startsWith("/api/live-score") ||
                path.startsWith("/api/tournaments") ||
                path.startsWith("/api/teams") ||
                path.startsWith("/api/team-members") ||
                path.startsWith("/api/notice-board") ||
                path.startsWith("/api/gallery") ||
                path.startsWith("/api/dashboard/stats") ||
                path.startsWith("/api/chatbot")) {
                return true;
            }
        }
        if (path.startsWith("/api/chatbot/message")) {
            return true;
        }
        return false;
    }

    private boolean isAdminOnlyEndpoint(String path, String method) {
        // User list
        if (path.equals("/api/auth/users")) {
            return true;
        }
        // All user forms listing or deletion
        if (path.equals("/api/users-form") && "GET".equalsIgnoreCase(method)) {
            return true;
        }
        if (path.startsWith("/api/users-form/") && "DELETE".equalsIgnoreCase(method)) {
            return true;
        }
        // Managing sports catalog
        if (path.startsWith("/api/sports") && !("GET".equalsIgnoreCase(method))) {
            return true;
        }
        // Managing tournaments
        if (path.startsWith("/api/tournaments") && !("GET".equalsIgnoreCase(method))) {
            return true;
        }
        // Managing teams
        if (path.startsWith("/api/teams") && !("GET".equalsIgnoreCase(method))) {
            return true;
        }
        // Managing matches
        if (path.startsWith("/api/matches") && !("GET".equalsIgnoreCase(method))) {
            return true;
        }
        // Managing live scores
        if ((path.startsWith("/api/live-scores") || path.startsWith("/api/live-score")) && !("GET".equalsIgnoreCase(method))) {
            return true;
        }
        // Managing notices
        if (path.startsWith("/api/notice-board") && !("GET".equalsIgnoreCase(method))) {
            return true;
        }
        // Managing gallery
        if (path.startsWith("/api/gallery") && !("GET".equalsIgnoreCase(method))) {
            return true;
        }
        return false;
    }

    private String extractToken(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }
        if (authHeader != null && !authHeader.trim().isEmpty()) {
            return authHeader.trim();
        }
        // Fallback to query parameter 'token' (e.g. for SSE stream)
        String queryToken = request.getParameter("token");
        if (queryToken != null && !queryToken.trim().isEmpty()) {
            return queryToken.trim();
        }
        return null;
    }

    private void writeError(HttpServletResponse response, int status, String error, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        String safeMsg = message != null ? message.replace("\"", "\\\"") : "";
        String json = "{\"timestamp\":\"" + LocalDateTime.now() + "\",\"status\":" + status + ",\"error\":\"" + error + "\",\"message\":\"" + safeMsg + "\"}";

        response.getWriter().write(json);
    }
}

