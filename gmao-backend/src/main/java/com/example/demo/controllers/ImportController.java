package com.example.demo.controllers;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.services.EquipementImportService;

@RestController
@RequestMapping("/api/import")
public class ImportController {

    private final EquipementImportService importService;

    public ImportController(EquipementImportService importService) {
        this.importService = importService;
    }

    @PostMapping
    public ResponseEntity<String> importExcel(@RequestParam("file") MultipartFile file) {
        try {
            importService.importExcel(file);
            return ResponseEntity.ok("Import réussi !");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Erreur lors de l'import");
        }
    }
}