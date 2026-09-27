package com.example.demo.services;

import com.example.demo.dto.DICreateRequest;
import com.example.demo.models.*;
import com.example.demo.repositories.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class DIService {

    private final DIRepository diRepository;
    private final OTRepository otRepository;
    private final EquipementRepository equipementRepository;
    private final UserService userService;
    private final UserRepository userRepository;
    private final NotificationService notif;

    public DIService(DIRepository diRepository,
                     OTRepository otRepository,
                     EquipementRepository equipementRepository,
                     UserService userService,
                     UserRepository userRepository,
                     NotificationService notif) {
        this.diRepository = diRepository;
        this.otRepository = otRepository;
        this.equipementRepository = equipementRepository;
        this.userService = userService;
        this.userRepository = userRepository;
        this.notif = notif;
    }

    // ===== CRÉER UNE DI =====
    @Transactional
    public DI createDI(DICreateRequest request) {
        if (request.getEquipementId() == null) {
            throw new IllegalArgumentException("L'ID de l'équipement ne peut pas être null");
        }

        Equipement equipement = equipementRepository
                .findById(request.getEquipementId())
                .orElseThrow(() -> new RuntimeException("Équipement introuvable"));

        User user = userService.getCurrentUser();

        DI di = new DI();
        di.setEquipement(equipement);
        di.setDescription(request.getDescription());
        di.setSource(request.getSource());
        di.setPriorite(request.getPriorite());
        di.setDateDemande(LocalDateTime.now());
        di.setStatut(StatutDI.Cree);
        di.setDemandeur(user);
        di.setCodeDI("TEMP"); // ← valeur temporaire pour éviter null constraint

        // 1er save → génère l'id
        DI saved = diRepository.save(di);

        // Générer le code avec l'id maintenant disponible
        int year = LocalDate.now().getYear() % 100;
        saved.setCodeDI(String.format("DI%06d%02d", saved.getId(), year));

        // 2ème save → persiste le vrai code
        DI result = diRepository.save(saved);

        notif.creerNotification(user, "Nouvelle DI " + result.getCodeDI()
                + " créée pour l'équipement " + equipement.getCodeEquipement());

        return result;
    }

    // ===== VALIDER UNE DI + CRÉER L'OT =====
    @Transactional
    public DI validerDI(Long diId, Long technicienId) {
        DI di = diRepository.findById(diId)
                .orElseThrow(() -> new RuntimeException("DI introuvable"));

        // Mettre à jour le statut de la DI
        di.setStatut(StatutDI.Validee);
        di.setDateValidation(LocalDateTime.now());
        diRepository.save(di);

        User superviseur = userService.getCurrentUser();
        User technicien = userRepository.findById(technicienId)
                .orElseThrow(() -> new RuntimeException("Technicien introuvable"));

        // Créer l'OT lié
        OT ot = new OT();
        ot.setDi(di);
        ot.setEquipement(di.getEquipement());
        ot.setPriorite(di.getPriorite());
        ot.setStatut(StatutOT.Cree);
        ot.setTypeOT(TypeOT.Correctif);
        ot.setSuperviseur(superviseur);
        ot.setTechnicien(technicien);
        ot.setCodeOT("TEMP"); // ← valeur temporaire

        // 1er save OT → génère l'id
        OT savedOt = otRepository.save(ot);

        // Générer le code OT avec l'id
        int year = LocalDate.now().getYear() % 100;
        savedOt.setCodeOT(String.format("OT%06d%02d", savedOt.getId(), year));

        // 2ème save → persiste le vrai code OT
        OT finalOt = otRepository.save(savedOt);

        // Notifications avec les vrais codes
        notif.creerNotification(superviseur,
                 di.getCodeDI() + " validée — " + finalOt.getCodeOT() + " généré");
        notif.creerNotification(technicien,
                "Vous avez été affecté à l'OT " + finalOt.getCodeOT());

        return di;
    }

    // ===== GETTERS =====
    public List<DI> getAll() {
        return diRepository.findAll();
    }

    public DI getById(Long id) {
        return diRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DI introuvable"));
    }

    @Transactional
    public DI updateDI(Long id, DICreateRequest request) {
        DI di = diRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DI introuvable"));

        if (request.getDescription() != null)
            di.setDescription(request.getDescription());
        if (request.getSource() != null)
            di.setSource(request.getSource());
        if (request.getPriorite() != null)
            di.setPriorite(request.getPriorite());

        return diRepository.save(di);
    }
    
    @Transactional
    public DI rejeterDI(Long id) {
        DI di = diRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DI introuvable"));
        di.setStatut(StatutDI.Rejetee);
        return diRepository.save(di);
    }
    
    public void delete(Long id) {
        diRepository.deleteById(id);
    }
}