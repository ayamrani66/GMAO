package com.example.demo.services;

import com.example.demo.dto.PieceRechangeDTO;
import com.example.demo.models.PieceRechange;
import com.example.demo.repositories.PieceRechangeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PieceRechangeService {

    @Autowired
    private PieceRechangeRepository repository;

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public List<PieceRechangeDTO> getAll() {
        return repository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
    }

    public PieceRechangeDTO getById(Long id) {
        return repository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("PDR introuvable avec l'id: " + id));
    }

    public PieceRechangeDTO create(PieceRechangeDTO dto) {
        if (repository.existsByCode(dto.getCode())) {
            throw new RuntimeException("Une PDR avec le code '" + dto.getCode() + "' existe déjà");
        }
        PieceRechange entity = toEntity(dto);
        return toDTO(repository.save(entity));
    }

    public PieceRechangeDTO update(Long id, PieceRechangeDTO dto) {
        PieceRechange existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("PDR introuvable avec l'id: " + id));

        if (repository.existsByCodeAndIdNot(dto.getCode(), id)) {
            throw new RuntimeException("Une PDR avec le code '" + dto.getCode() + "' existe déjà");
        }

        existing.setNom(dto.getNom());
        existing.setCode(dto.getCode());
        existing.setUnite(dto.getUnite());
        existing.setQuantiteStock(dto.getQuantiteStock());
        existing.setSeuilAlerte(dto.getSeuilAlerte());
        existing.setDescription(dto.getDescription());
        existing.setFournisseur(dto.getFournisseur());
        existing.setPrixUnitaire(dto.getPrixUnitaire());
        existing.setEmplacement(dto.getEmplacement());

        return toDTO(repository.save(existing));
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("PDR introuvable avec l'id: " + id);
        }
        repository.deleteById(id);
    }

    public boolean existsByCode(String code) {
        return repository.existsByCode(code);
    }

    public List<PieceRechangeDTO> getPdrEnAlerte() {
        return repository.findPdrEnAlerte().stream().map(this::toDTO).collect(Collectors.toList());
    }

    // Mapping Entity -> DTO
    private PieceRechangeDTO toDTO(PieceRechange p) {
        PieceRechangeDTO dto = new PieceRechangeDTO();
        dto.setId(p.getId());
        dto.setNom(p.getNom());
        dto.setCode(p.getCode());
        dto.setUnite(p.getUnite());
        dto.setQuantiteStock(p.getQuantiteStock());
        dto.setSeuilAlerte(p.getSeuilAlerte());
        dto.setDescription(p.getDescription());
        dto.setFournisseur(p.getFournisseur());
        dto.setPrixUnitaire(p.getPrixUnitaire());
        dto.setEmplacement(p.getEmplacement());
        if (p.getDateCreation() != null) dto.setDateCreation(p.getDateCreation().format(FORMATTER));
        if (p.getDateModification() != null) dto.setDateModification(p.getDateModification().format(FORMATTER));
        return dto;
    }

    // Mapping DTO -> Entity
    private PieceRechange toEntity(PieceRechangeDTO dto) {
        PieceRechange p = new PieceRechange();
        p.setNom(dto.getNom());
        p.setCode(dto.getCode());
        p.setUnite(dto.getUnite());
        p.setQuantiteStock(dto.getQuantiteStock() != null ? dto.getQuantiteStock() : 0.0);
        p.setSeuilAlerte(dto.getSeuilAlerte() != null ? dto.getSeuilAlerte() : 0.0);
        p.setDescription(dto.getDescription());
        p.setFournisseur(dto.getFournisseur());
        p.setPrixUnitaire(dto.getPrixUnitaire());
        p.setEmplacement(dto.getEmplacement());
        return p;
    }
}