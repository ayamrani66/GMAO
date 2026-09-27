package com.example.demo.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.time.LocalDateTime;

@Entity
@Table(name = "pieces_rechange")
public class PieceRechange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Le nom est obligatoire")
    @Column(nullable = false)
    private String nom;

    @NotBlank(message = "Le code est obligatoire")
    @Column(nullable = false, unique = true)
    private String code;

    @NotNull(message = "L'unité est obligatoire")
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UniteCalcul unite;

    @PositiveOrZero(message = "La quantité en stock doit être positive ou nulle")
    @Column(name = "quantite_stock", nullable = false)
    private Double quantiteStock = 0.0;

    @PositiveOrZero
    @Column(name = "seuil_alerte")
    private Double seuilAlerte = 0.0;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "fournisseur")
    private String fournisseur;

    @Column(name = "prix_unitaire")
    private Double prixUnitaire;

    @Column(name = "emplacement")
    private String emplacement;

    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
        dateModification = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dateModification = LocalDateTime.now();
    }

    // Enum des unités de calcul
    public enum UniteCalcul {
        GRAMME("g"),
        KILOGRAMME("kg"),
        LITRE("L"),
        MILLILITRE("mL"),
        METRE("m"),
        CENTIMETRE("cm"),
        MILLIMETRE("mm"),
        PIECE("pce"),
        UNITE("u"),
        BOITE("boîte"),
        ROULEAU("rouleau"),
        TONNE("t");

        private final String libelle;

        UniteCalcul(String libelle) {
            this.libelle = libelle;
        }

        public String getLibelle() {
            return libelle;
        }
    }

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

    public LocalDateTime getDateCreation() { return dateCreation; }
    public LocalDateTime getDateModification() { return dateModification; }
}