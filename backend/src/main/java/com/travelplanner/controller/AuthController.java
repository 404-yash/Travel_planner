package com.travelplanner.controller;

import com.travelplanner.dto.AuthRequest;
import com.travelplanner.dto.AuthResponse;
import com.travelplanner.dto.RegisterRequest;
import com.travelplanner.entity.User;
import com.travelplanner.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest req) {
        return ResponseEntity.ok(userService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest req) {
        return ResponseEntity.ok(userService.authenticate(req));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(new AuthResponse(null, user.getEmail(), user.getName(), user.getRole().name()));
    }
}
