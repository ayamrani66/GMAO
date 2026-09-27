package com.example.demo.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
@Entity
@Table(name = "documents")
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom_fichier")
    private String nomFichier;

    @Column(name = "type")
    private String type;

    @Column(name = "chemin")
    private String chemin;

    @ManyToOne
    @JoinColumn(name = "equipement_id", nullable = true)
    @JsonIgnoreProperties({"parent", "children"})
    private Equipement equipement;

    @ManyToOne
    @JoinColumn(name = "di_id", nullable = true)
    @JsonIgnoreProperties({"demandeur", "equipement"})
    private DI di;

    @ManyToOne
    @JoinColumn(name = "ot_id", nullable = true)
    @JsonIgnoreProperties({"technicien", "superviseur", "equipement", "di"})
    private OT ot;

    public Document() {}

    // Getters/Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNomFichier() { return nomFichier; }
    public void setNomFichier(String nomFichier) { this.nomFichier = nomFichier; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getChemin() { return chemin; }
    public void setChemin(String chemin) { this.chemin = chemin; }
    public Equipement getEquipement() { return equipement; }
    public void setEquipement(Equipement equipement) { this.equipement = equipement; }
    public DI getDi() { return di; }
    public void setDi(DI di) { this.di = di; }
    public OT getOt() { return ot; }
    public void setOt(OT ot) { this.ot = ot; }
}