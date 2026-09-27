package com.example.demo.controllers;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.models.*;
import com.example.demo.services.*;
import com.example.demo.repositories.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final UserService userService;
    private final DIRepository diRepository;
    private final OTRepository otRepository;

    public ProfileController(UserService userService,
                              DIRepository diRepository,
                              OTRepository otRepository) {
        this.userService = userService;
        this.diRepository = diRepository;
        this.otRepository = otRepository;
    }

    @GetMapping
    public ResponseEntity<User> getProfile() {
        return ResponseEntity.ok(userService.getCurrentUser());
    }

    @GetMapping("/di")
    public ResponseEntity<List<DI>> getMyDI() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(diRepository.findByDemandeurOrderByDateDemandeDesc(user));
    }

    @GetMapping("/ot")
    public ResponseEntity<List<OT>> getMyOT() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(otRepository.findByTechnicienOrSuperviseurOrderByIdDesc(user, user));
    }
}
