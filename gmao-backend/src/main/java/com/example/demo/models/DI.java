package com.example.demo.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "demandes_intervention")
public class DI {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code_di", unique = true, nullable=false)
    private String codeDI;
    
    @ManyToOne
    @JoinColumn(name = "equipement_id")
    @JsonIgnoreProperties({"parent", "children"})
    private Equipement equipement;
    
    @Column(name = "statut", nullable=false)
    @Enumerated(EnumType.STRING)
    private StatutDI statut;

    @Column(name="description", nullable=false)
    private String description;

    @Column(name = "date_demande", nullable=false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateDemande;
    
    @ManyToOne
    @JsonIgnoreProperties({"password", "authorities", "accountNonExpired", 
        "accountNonLocked", "credentialsNonExpired", "enabled"})
    @JoinColumn(name = "Demandeur", nullable = false)
    private User demandeur;
    
    @Column(name = "source", nullable=false)
    @Enumerated(EnumType.STRING)
    private Source source;

    @Column(name = "priorite", nullable=false)
    @Enumerated(EnumType.STRING)
    private Priorite priorite;
    
    @Column(name = "date_validation")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateValidation;
    
    @Column(name="temps_intervention")
    private Double tempsIntervention;

    @Column(name="cause_identifiee")
    private String causeIdentifiee;
    
    @OneToMany(mappedBy = "di", fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"di", "ot", "equipement"})
    private List<Document> documents = new ArrayList<>();

    // Constructeurs
    public DI() {}

    public DI(Equipement equipement,String codeDI, String description,Double tempsIntervention,String causeIdentifiee, LocalDateTime dateDemande, Priorite priorite, StatutDI statut,  LocalDateTime dateValidation, Source source, User demandeur) {
        this.equipement = equipement;
        this.description = description;
        this.dateDemande = dateDemande;
        this.priorite = priorite;
        this.statut = statut;
        this.dateValidation=dateValidation;
        this.causeIdentifiee=causeIdentifiee;
        this.tempsIntervention=tempsIntervention;
        this.source=source;
        this.demandeur=demandeur;
        this.codeDI=codeDI;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    @PostPersist
    public void genererCode() {
        int year = java.time.LocalDate.now().getYear() % 100;
        this.codeDI = String.format("DI%06d%02d", this.id, year);
    }
    
    public String getCodeDI() { return codeDI; }
    public void setCodeDI(String codeDI) { this.codeDI = codeDI; }

    public List<Document> getDocuments() { return documents; }
    
    public void setDocuments(List<Document> documents) {
		this.documents = documents;
	}

	public Equipement getEquipement() { return equipement; }
    public void setEquipement(Equipement equipement) { this.equipement = equipement; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getCauseIdentifiee() { return causeIdentifiee; }
    public void setCauseIdentifiee(String causeIdentifiee) { this.causeIdentifiee = causeIdentifiee; }
    
    public Double getTempsIntervention() { return tempsIntervention; }
    public void setTempsIntervention(Double tempsIntervention) { this.tempsIntervention = tempsIntervention; }

    public LocalDateTime getDateDemande() { return dateDemande; }
    public void setDateDemande(LocalDateTime dateDemande) { this.dateDemande = dateDemande; }
    
    public LocalDateTime getDateValidation() { return dateValidation; }
    public void setDateValidation(LocalDateTime dateValidation) { this.dateValidation = dateValidation; }

    public Priorite getPriorite() { return priorite; }
    public void setPriorite(Priorite priorite) { this.priorite = priorite; }

    public StatutDI getStatut() { return statut; }
    public void setStatut(StatutDI statut) { this.statut = statut; }
    
    public Source getSource() { return source; }
    public void setSource(Source source) { this.source = source; }
    
    public User getDemandeur() { return demandeur; }
    public void setDemandeur(User demandeur) { this.demandeur = demandeur; }
}