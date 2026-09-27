package com.example.demo.services;

import com.example.demo.models.Document;
import com.example.demo.repositories.DIRepository;
import com.example.demo.repositories.DocumentRepository;
import com.example.demo.repositories.EquipementRepository;
import com.example.demo.repositories.OTRepository;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final EquipementRepository equipementRepository;
    private final DIRepository diRepository;
    private final OTRepository otRepository;

    // Dossier de stockage
    private final String uploadDir = "uploads/";

    public DocumentService(DocumentRepository documentRepository,
                           EquipementRepository equipementRepository,
                           DIRepository diRepository,
                           OTRepository otRepository) {
        this.documentRepository = documentRepository;
        this.equipementRepository = equipementRepository;
        this.diRepository = diRepository;
        this.otRepository = otRepository;
    }

    public Document saveDocument(MultipartFile file, Long equipementId,
                                  Long diId, Long otId) throws IOException {

        // Créer le dossier si inexistant
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Nom unique
        String nomFichier = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(nomFichier);
        Files.copy(file.getInputStream(), filePath);

        Document doc = new Document();
        doc.setNomFichier(nomFichier);
        doc.setType(file.getContentType());
        doc.setChemin(filePath.toString());

        if (equipementId != null) {
            equipementRepository.findById(equipementId).ifPresent(doc::setEquipement);
        }
        if (diId != null) {
            diRepository.findById(diId).ifPresent(doc::setDi);
        }
        if (otId != null) {
            otRepository.findById(otId).ifPresent(doc::setOt);
        }

        return documentRepository.save(doc);
    }

    public List<Document> getByDi(Long diId) {
        return documentRepository.findByDiId(diId);
    }

    public List<Document> getByOt(Long otId) {
        return documentRepository.findByOtId(otId);
    }

    public List<Document> getByEquipement(Long equipementId) {
        return documentRepository.findByEquipementId(equipementId);
    }

    public Resource loadFile(String nomFichier) throws IOException {
        Path filePath = Paths.get(uploadDir).resolve(nomFichier);
        Resource resource = new UrlResource(filePath.toUri());
        if (resource.exists()) return resource;
        throw new RuntimeException("Fichier introuvable : " + nomFichier);
    }
}
