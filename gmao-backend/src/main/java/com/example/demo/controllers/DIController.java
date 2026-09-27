package com.example.demo.controllers;

import com.example.demo.dto.DICreateRequest;
import com.example.demo.models.DI;
import com.example.demo.repositories.DIRepository;
import com.example.demo.services.DIService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/di")
public class DIController {

    private final DIService service;
    private final DIRepository repository;

    public DIController(DIService service, DIRepository repository) {
        this.service = service;
        this.repository=repository;
    }

    @GetMapping
    public List<DI> getAll() {
        return service.getAll();
    }

    @PostMapping
    public DI createDI(@RequestBody DICreateRequest request) {

        return service.createDI(request);
    }
    
    @GetMapping("/by-equipement/{id}")
    public List<DI> getByEquipement(
            @PathVariable Long id) {

        return repository.findByEquipementId(id);
    }
   
    @GetMapping("/{id}")
    public DI getById(@PathVariable Long id) {
        return service.getById(id);
    }
    
    @PutMapping("/{id}/valider")
    public ResponseEntity<DI> validerDI(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        Long technicienId = body.get("technicienId");
        return ResponseEntity.ok(service.validerDI(id, technicienId));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<DI> update(@PathVariable Long id, @RequestBody DICreateRequest request) {
        return ResponseEntity.ok(service.updateDI(id, request));
    }
    
    @PutMapping("/{id}/rejeter")
    public ResponseEntity<DI> rejeter(@PathVariable Long id) {
        return ResponseEntity.ok(service.rejeterDI(id));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}