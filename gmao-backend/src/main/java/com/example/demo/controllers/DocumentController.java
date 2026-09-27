package com.example.demo.controllers;

import com.example.demo.models.Document;
import com.example.demo.services.DocumentService;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Document> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "equipementId", required = false) Long equipementId,
            @RequestParam(value = "diId", required = false) Long diId,
            @RequestParam(value = "otId", required = false) Long otId) throws IOException {
        return ResponseEntity.ok(documentService.saveDocument(file, equipementId, diId, otId));
    }

    @GetMapping("/di/{diId}")
    public List<Document> getByDi(@PathVariable Long diId) {
        return documentService.getByDi(diId);
    }

    @GetMapping("/ot/{otId}")
    public List<Document> getByOt(@PathVariable Long otId) {
        return documentService.getByOt(otId);
    }

    @GetMapping("/equipement/{equipementId}")
    public List<Document> getByEquipement(@PathVariable Long equipementId) {
        return documentService.getByEquipement(equipementId);
    }

    @GetMapping("/download/{nomFichier}")
    public ResponseEntity<Resource> download(@PathVariable String nomFichier) throws IOException {
        Resource resource = documentService.loadFile(nomFichier);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + nomFichier + "\"")
                .body(resource);
    }
   
}
