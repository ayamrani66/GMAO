package com.example.demo.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.AssignRoleRequest;
import com.example.demo.dto.UpdateProfileRequest;
import com.example.demo.models.*;
import com.example.demo.services.UserService;

@RestController
@RequestMapping("/api/users")
public class UserController {
	
	UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }
	
	@GetMapping("/techniciens")
	public List<User> getTechniciens() {
	    return userService.getUsersByRole(Role.TECHNICIEN);
	}
	
    @GetMapping
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<List<User>> getPendingUsers() {
        return ResponseEntity.ok(userService.getUsersByRole(Role.PENDING));
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('RESPONSABLE')")
    public ResponseEntity<User> assignRole(@PathVariable Long id,
                                           @RequestBody AssignRoleRequest request) {
        User updated = userService.assignRole(id, request.getRole());
        return ResponseEntity.ok(updated);
    }
    
    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(@RequestBody UpdateProfileRequest request) {
      User currentUser = userService.getCurrentUser();
      User updated = userService.updateProfile(currentUser.getId(), request);
      return ResponseEntity.ok(updated);
}

}
