package com.example.demo.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "equipements")
public class Equipement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code_equipement", nullable = false, unique = true)
    private String codeEquipement;
    
    @Column(name = "code_parent", nullable=true)
    private String codeParent;

    @ManyToOne
    @JoinColumn(name = "parent_id", nullable=true)
    private Equipement parent;

    @OneToMany(mappedBy = "parent")
    private List<Equipement> enfants;
    
    @Column(name = "niveau", nullable = false)
    private int niveau;

    @Column(nullable = false, name="libelle")
    private String libelle;

    @Column(name = "compteur")
    private Double compteur;
    
    @Column(name="date_installation")
    private LocalDate date_installation;
    
    @Column(name="criticite")
    @Enumerated(EnumType.STRING)
    private Criticite criticite;
    
    @Column(name="archive")
    private Boolean archive = false;

    @Column(name="Cause_archivage")
    private String causeArchivage;
    
    @Column(name="localisation")
    private String localisation;

    public Equipement() {}

    public Equipement(String codeEquipement,String codeParent, Equipement parent, Boolean archive, String causeArchivage, String libelle, Double compteur, int niveau, LocalDate date_installation, Criticite criticite, String localisation) {
        this.codeEquipement = codeEquipement;
        this.libelle = libelle;
        this.compteur = compteur;
        this.niveau=niveau;
        this.date_installation=date_installation;
        this.criticite=criticite;
        this.parent=parent;
        this.archive=archive;
        this.causeArchivage=causeArchivage;
        this.codeParent=codeParent;
        this.localisation=localisation;
    }


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCodeEquipement() { return codeEquipement; }
    public void setCodeEquipement(String codeEquipement) { this.codeEquipement = codeEquipement; }
    
    public String getCodeParent() { return codeParent; }
    public void setCodeParent(String codeParent) { this.codeParent = codeParent; }

    public Equipement getParent() { return parent; }
    public void setParent(Equipement parent) { this.parent = parent; }

    public String getLibelle() { return libelle; }
    public void setLibelle(String libelle) { this.libelle = libelle; }
    
    public String getCauseArchivage() { return causeArchivage; }
    public void setCauseArchivage(String causeArchivage) { this.causeArchivage = causeArchivage; }
    
    public String getLocalisation() { return localisation; }
    public void setLocalisation(String localisation) { this.localisation = localisation; }
    
    public Boolean getArchive() {return archive; }
    public void setArchive(Boolean archive) {this.archive=archive;}

    public Double getCompteur() { return compteur; }
    public void setCompteur(Double compteur) { this.compteur = compteur; }
    
    public int getNiveau() { return niveau; }
    public void setNiveau(int niveau) { this.niveau = niveau; }
    
    public Criticite getCriticite() { return criticite; }
    public void setCriticite(Criticite criticite) { this.criticite = criticite; }
    
    public LocalDate getDateInstallation() { return date_installation; }
    public void setDateInstallation(LocalDate date_installation) { this.date_installation = date_installation; }

}