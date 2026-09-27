package com.example.demo.services;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import com.example.demo.models.*;
import com.example.demo.repositories.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(User user){

    	if (userRepository.existsByMail(user.getMail())) {
            throw new RuntimeException("Email déjà utilisé");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(Role.PENDING);  
        return userRepository.save(user);
    }

    public User login(String mail, String password){

        User user = userRepository.findByMail(mail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(!passwordEncoder.matches(password, user.getPassword())){
            throw new RuntimeException("Mot de passe incorrect");
        }
        if (user.getRole() == Role.PENDING) {
            throw new RuntimeException("Votre compte est en attente de validation par un responsable.");
        }
        return user;
    }
    
}
