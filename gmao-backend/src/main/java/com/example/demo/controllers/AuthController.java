package com.example.demo.controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.conf.JwtUtil;
import com.example.demo.dto.LoginRequest;
import com.example.demo.models.User;
import com.example.demo.repositories.UserRepository;
import com.example.demo.services.AuthService;

import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;
	private final JwtUtil jwtUtil;
	private final UserRepository userRepository;

    public AuthController(AuthService authService, JwtUtil jwtUtil, UserRepository userRepository){
        this.authService = authService;
        this.jwtUtil=jwtUtil;
        this.userRepository=userRepository;
    }

    @PostMapping("/register")
    public User register(@RequestBody User user){
        return authService.register(user);
    }
    
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody LoginRequest request) {
        User user = authService.login(request.getMail(), request.getPassword());
        String token = jwtUtil.generateToken(user.getMail());
        return Map.of(
            "token", token,
            "mail", user.getMail(),
            "role", user.getRole().name(),
            "nomComplet", user.getNomComplet()
        );
    }
    @GetMapping("/check-mail")
    public ResponseEntity<Boolean> checkMail(@RequestParam String mail) {
        boolean exists = userRepository.existsByMail(mail);
        return ResponseEntity.ok(exists);
    }

}
