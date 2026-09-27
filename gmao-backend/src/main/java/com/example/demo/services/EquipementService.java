package com.example.demo.services;

import com.example.demo.models.Equipement;

import com.example.demo.repositories.EquipementRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EquipementService {

    private final EquipementRepository equipementRepository;
    
    public EquipementService(EquipementRepository equipementRepository) {
        this.equipementRepository = equipementRepository;
    }

    public Equipement create(Equipement e) {
        return equipementRepository.save(e);
    }

    public List<Equipement> getAll() {
        return equipementRepository.findAll();
    }
    
    public Optional<Equipement> findById(Long id) {
        return equipementRepository.findById(id);
    }

    public Equipement update(Long id, Equipement e) {
        Equipement existing = equipementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Equipement non trouvé"));

        existing.setCodeEquipement(e.getCodeEquipement());
        existing.setCodeParent(e.getCodeParent());
        existing.setLibelle(e.getLibelle());
        existing.setNiveau(e.getNiveau());
        existing.setCompteur(e.getCompteur());
        existing.setDateInstallation(e.getDateInstallation());
        existing.setCriticite(e.getCriticite());
        existing.setLocalisation(e.getLocalisation());
        existing.setArchive(e.getArchive());
        existing.setCauseArchivage(e.getCauseArchivage());

        return equipementRepository.save(existing);
    }

    public void delete(Long id) {
        equipementRepository.deleteById(id);
    }
}
