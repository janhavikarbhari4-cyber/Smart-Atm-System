package com.smartatm.controller;

import com.smartatm.model.User;
import com.smartatm.service.AtmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow frontend to connect
public class AtmController {

    @Autowired
    private AtmService atmService;

    // In a real app, we'd use Spring Security. For this demo, we use a simple map.
    private User activeUser;

    @PostMapping("/auth/signup")
    public ResponseEntity<?> signup(@RequestBody Map<String, String> payload) {
        try {
            atmService.signup(
                payload.get("username"),
                payload.get("pin"),
                Double.parseDouble(payload.get("balance")),
                Double.parseDouble(payload.get("goal"))
            );
            return ResponseEntity.ok(Map.of("message", "Registration successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> payload) {
        try {
            activeUser = atmService.login(payload.get("username"), payload.get("pin"));
            return ResponseEntity.ok(activeUser);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/data")
    public ResponseEntity<?> getUserData() {
        if (activeUser == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(activeUser);
    }

    @PostMapping("/tx/execute")
    public ResponseEntity<?> executeTx(@RequestBody Map<String, String> payload) {
        try {
            if (activeUser == null) throw new RuntimeException("Unauthorized");
            atmService.executeTransaction(activeUser, payload.get("type"), Double.parseDouble(payload.get("amount")));
            return ResponseEntity.ok(activeUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/user/update-goal")
    public ResponseEntity<?> updateGoal(@RequestBody Map<String, String> payload) {
        try {
            if (activeUser == null) throw new RuntimeException("Unauthorized");
            atmService.updateGoal(activeUser, Double.parseDouble(payload.get("goal")));
            return ResponseEntity.ok(activeUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user/insights")
    public ResponseEntity<?> getInsights() {
        if (activeUser == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(atmService.getInsights(activeUser));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<?> logout() {
        activeUser = null;
        return ResponseEntity.ok().build();
    }
}

