package com.example.demo.controllers;

import com.example.demo.dto.PieceRechangeDTO;
import com.example.demo.services.PieceRechangeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pieces-rechange")
@CrossOrigin(origins = "http://localhost:4200")
public class PieceRechangeController {

    @Autowired
    private PieceRechangeService service;

    // GET /api/pieces-rechange
    @GetMapping
    public ResponseEntity<List<PieceRechangeDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    // GET /api/pieces-rechange/{id}
    @GetMapping("/{id}")
    public ResponseEntity<PieceRechangeDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // GET /api/pieces-rechange/alerte
    @GetMapping("/alerte")
    public ResponseEntity<List<PieceRechangeDTO>> getPdrEnAlerte() {
        return ResponseEntity.ok(service.getPdrEnAlerte());
    }

    // GET /api/pieces-rechange/exists/{code}
    @GetMapping("/exists/{code}")
    public ResponseEntity<Map<String, Boolean>> existsByCode(@PathVariable String code) {
        return ResponseEntity.ok(Map.of("exists", service.existsByCode(code)));
    }

    // POST /api/pieces-rechange
    @PostMapping
    public ResponseEntity<PieceRechangeDTO> create(@Valid @RequestBody PieceRechangeDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    // PUT /api/pieces-rechange/{id}
    @PutMapping("/{id}")
    public ResponseEntity<PieceRechangeDTO> update(@PathVariable Long id,
                                                    @Valid @RequestBody PieceRechangeDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    // DELETE /api/pieces-rechange/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}