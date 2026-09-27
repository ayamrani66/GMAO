package com.example.demo.services;

import java.util.List;


import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.demo.dto.UpdateProfileRequest;
import com.example.demo.models.Role;
import com.example.demo.models.User;
import com.example.demo.repositories.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User loadUserByMail(String mail){
        return userRepository.findByMail(mail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null || !authentication.isAuthenticated() 
           || authentication.getPrincipal().equals("anonymousUser")) {
            throw new RuntimeException("Utilisateur non connecté");
        }
        return (User) authentication.getPrincipal(); // OK car User implements UserDetails
    }
    
    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // ✅ NOUVEAU : assigner un rôle
    public User assignRole(Long userId, Role role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé : " + userId));
        user.setRole(role);
        return userRepository.save(user);
    }
    
    public User updateProfile(Long userId, UpdateProfileRequest request) {
      User user = userRepository.findById(userId)
              .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

      user.setNomComplet(request.getNomComplet());
      user.setTelephone(request.getTelephone());


      if (request.getNewPassword() != null && !request.getNewPassword().isEmpty()) {
          if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
              throw new RuntimeException("Ancien mot de passe incorrect.");
         }
          if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
              throw new RuntimeException("Le nouveau mot de passe doit être différent de l'ancien.");
          }
         user.setPassword(passwordEncoder.encode(request.getNewPassword()));
      }
 //
      return userRepository.save(user);

}
}