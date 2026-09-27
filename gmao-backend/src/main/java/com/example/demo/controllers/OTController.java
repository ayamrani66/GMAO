package com.example.demo.controllers;

import com.example.demo.dto.OTCreateRequest;
import com.example.demo.models.OT;
import com.example.demo.models.StatutOT;
import com.example.demo.repositories.OTRepository;
import com.example.demo.services.OTService;
import com.example.demo.services.PDFService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ot")
public class OTController {

    private final OTService service;
    private final OTRepository repository;
    private final PDFService pdfService;

    public OTController(OTService service, PDFService pdfService, OTRepository repository) {
        this.service = service;
        this.pdfService=pdfService;
        this.repository=repository;
    }
    
    @GetMapping("/by-equipement/{id}")
    public List<OT> getByEquipement(
            @PathVariable Long id) {

        return repository.findByEquipementId(id);
    }

    @GetMapping
    public List<OT> getAll() {
        return service.getAll();
    }

    @PostMapping
    public ResponseEntity<OT> createOT(@RequestBody OTCreateRequest request) {
        return ResponseEntity.ok(service.createOT(request));
    }

    @GetMapping("/{id}")
    public OT getById(@PathVariable Long id) {
        return service.getById(id);
    }
    
    @PutMapping("/{id}/statut")
    public ResponseEntity<OT> updateStatut(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String statut = body.get("statut");
        return ResponseEntity.ok(service.updateStatut(id, StatutOT.valueOf(statut)));
    }
    
    @PutMapping("/{id}/compte-rendu")
    public ResponseEntity<OT> setCompteRendu(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.setCompteRendu(id, body.get("compteRendu")));
    }
    
    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> telechargerPDF(@PathVariable Long id) {

        OT ot = service.getById(id);

        byte[] pdf = pdfService.genererCompteRenduPDF(ot);

        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=compte_rendu_OT_" + id + ".pdf")
                .header("Content-Type", "application/pdf")
                .body(pdf);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}