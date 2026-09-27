package com.example.demo.services;

import com.example.demo.dto.OTCreateRequest;
import com.example.demo.models.*;
import com.example.demo.repositories.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;

@Service
public class OTService {

    private final OTRepository repository;
    private final PDFService pdfService;
    private final EquipementRepository equipementRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final DIRepository diRepository;

    public OTService(OTRepository repository,
                     PDFService pdfService,
                     EquipementRepository equipementRepository,
                     UserService userService,
                     UserRepository userRepository,
                     DIRepository diRepository) {
        this.repository = repository;
        this.pdfService = pdfService;
        this.equipementRepository = equipementRepository;
        this.userService = userService;
        this.userRepository = userRepository;
        this.diRepository = diRepository;
    }

    // ===== GETTERS =====

    public List<OT> getAll() {
        return repository.findAll();
    }

    public OT getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("OT introuvable"));
    }

    // ===== CRÉER UN OT =====

    @Transactional
    public OT createOT(OTCreateRequest request) {
        Equipement equipement = equipementRepository
                .findById(request.getEquipementId())
                .orElseThrow(() -> new RuntimeException("Équipement introuvable"));

        User superviseur = userService.getCurrentUser();

        User technicien = userRepository
                .findById(request.getTechnicienId())
                .orElseThrow(() -> new RuntimeException("Technicien introuvable"));

        OT ot = new OT();
        ot.setEquipement(equipement);
        ot.setSuperviseur(superviseur);
        ot.setTechnicien(technicien);
        ot.setStatut(StatutOT.Cree);

        // Priorité avec valeur par défaut
        if (request.getPriorite() != null && !request.getPriorite().isEmpty()) {
            ot.setPriorite(Priorite.valueOf(request.getPriorite()));
        } else {
            ot.setPriorite(Priorite.Normale);
        }

        // TypeOT avec valeur par défaut
        if (request.getTypeOT() != null && !request.getTypeOT().isEmpty()) {
            ot.setTypeOT(TypeOT.valueOf(request.getTypeOT()));
        } else {
            ot.setTypeOT(TypeOT.Correctif);
        }

        // DI liée (optionnel)
        if (request.getDiId() != null) {
            diRepository.findById(request.getDiId())
                    .ifPresent(ot::setDi);
        }

        ot.setCodeOT("TEMP"); // ← valeur temporaire pour éviter null constraint

        // 1er save → génère l'id
        OT saved = repository.save(ot);

        // Générer le code avec l'id maintenant disponible
        int year = LocalDate.now().getYear() % 100;
        saved.setCodeOT(String.format("OT%06d%02d", saved.getId(), year));

        // 2ème save → persiste le vrai code
        return repository.save(saved);
    }

    // ===== METTRE À JOUR LE STATUT =====

    @Transactional
    public OT updateStatut(Long otId, StatutOT statut) {
        OT ot = repository.findById(otId)
                .orElseThrow(() -> new RuntimeException("OT introuvable"));

        ot.setStatut(statut);

        if (statut == StatutOT.termine) {
            ot.setDateExecution(LocalDateTime.now());
            byte[] pdf = pdfService.genererCompteRenduPDF(ot);
            if (pdf != null) {
                ot.setPdfCompteRendu(Base64.getEncoder().encodeToString(pdf));
            }
        }

        return repository.save(ot);
    }

    @Transactional
    public OT setCompteRendu(Long otId, String texte) {
        OT ot = repository.findById(otId)
                .orElseThrow(() -> new RuntimeException("OT introuvable"));
        ot.setCompteRendu(texte);
        return repository.save(ot);
    }
    // ===== SUPPRIMER =====

    public void delete(Long id) {
        repository.deleteById(id);
    }
}