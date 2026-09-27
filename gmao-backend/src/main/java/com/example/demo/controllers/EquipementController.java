package com.example.demo.controllers;

import com.example.demo.models.Equipement;

import com.example.demo.repositories.EquipementRepository;
import com.example.demo.services.EquipementService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipements")
public class EquipementController {

	private final EquipementService equipementService;
	private final EquipementRepository repo;
    
    public EquipementController(EquipementService equipementService, EquipementRepository repo) {
        this.equipementService = equipementService;
        this.repo=repo;
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Equipement> getById(@PathVariable Long id) {
        return equipementService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Equipement create(@RequestBody Equipement e) {
        return equipementService.create(e);
    }

    @GetMapping
    public List<Equipement> getAll() {
        return equipementService.getAll();
    }

    @PutMapping("/{id}")
    public Equipement update(@PathVariable Long id,
                             @RequestBody Equipement e) {
        return equipementService.update(id, e);
    }
    
    @GetMapping("/count")
    public long count() {
        return repo.count();
    }
    
    @GetMapping("/exists/{code}")
    public ResponseEntity<Boolean> existsByCode(@PathVariable String code) {
        return ResponseEntity.ok(repo.existsByCodeEquipement(code));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        equipementService.delete(id);
    }
}