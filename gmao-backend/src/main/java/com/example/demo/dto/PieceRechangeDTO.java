package com.example.demo.dto;

import com.example.demo.models.PieceRechange.UniteCalcul;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public class PieceRechangeDTO {

    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le code est obligatoire")
    private String code;

    @NotNull(message = "L'unité est obligatoire")
    private UniteCalcul unite;

    @PositiveOrZero
    private Double quantiteStock = 0.0;

    @PositiveOrZero
    private Double seuilAlerte = 0.0;

    private String description;
    private String fournisseur;
    private Double prixUnitaire;
    private String emplacement;
    private String dateCreation;
    private String dateModification;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public UniteCalcul getUnite() { return unite; }
    public void setUnite(UniteCalcul unite) { this.unite = unite; }

    public Double getQuantiteStock() { return quantiteStock; }
    public void setQuantiteStock(Double quantiteStock) { this.quantiteStock = quantiteStock; }

    public Double getSeuilAlerte() { return seuilAlerte; }
    public void setSeuilAlerte(Double seuilAlerte) { this.seuilAlerte = seuilAlerte; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFournisseur() { return fournisseur; }
    public void setFournisseur(String fournisseur) { this.fournisseur = fournisseur; }

    public Double getPrixUnitaire() { return prixUnitaire; }
    public void setPrixUnitaire(Double prixUnitaire) { this.prixUnitaire = prixUnitaire; }

    public String getEmplacement() { return emplacement; }
    public void setEmplacement(String emplacement) { this.emplacement = emplacement; }

    public String getDateCreation() { return dateCreation; }
    public void setDateCreation(String dateCreation) { this.dateCreation = dateCreation; }

    public String getDateModification() { return dateModification; }
    public void setDateModification(String dateModification) { this.dateModification = dateModification; }
}