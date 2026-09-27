package com.example.demo.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "ordres_travail")
public class OT {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "code_ot", unique = true, nullable=false)
    private String codeOT;

    @ManyToOne
    @JoinColumn(name = "di_id")
    private DI di;
    
    @ManyToOne
    @JoinColumn(name = "equipement_id")
    @JsonIgnoreProperties({"parent", "children"})
    private Equipement equipement;

    @Column(name = "date_execution")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateExecution;

    @ManyToOne
    @JoinColumn(name = "technicien", nullable = true)
    @JsonIgnoreProperties({"password", "authorities", "accountNonExpired",
        "accountNonLocked", "credentialsNonExpired", "enabled"})
    private User technicien;
    
	  @ManyToOne
	  @JoinColumn(name = "superviseur", nullable = true) 
	  @JsonIgnoreProperties({"password", "authorities", "accountNonExpired",
          "accountNonLocked", "credentialsNonExpired", "enabled"})
	  private User superviseur;
	 
	  @Column(name = "pdf_compte_rendu", columnDefinition = "LONGTEXT")
	  private String pdfCompteRendu;

    @Column(name = "statut", nullable=false)
    @Enumerated(EnumType.STRING)
    private StatutOT statut;
    
    @Column(name = "priorite", nullable=false)
    @Enumerated(EnumType.STRING)
    private Priorite priorite;
    
    @Column(name = "type_ot", nullable=false)
    @Enumerated(EnumType.STRING)
    private TypeOT typeOT;
    
    @Column(name = "compte_rendu", length = 5000)
    private String compteRendu;
    
    @Column(name="temps_intervention")
    private LocalDateTime tempsIntervention;
    
    @OneToMany(mappedBy = "ot", fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"di", "ot", "equipement"})
    private List<Document> documents = new ArrayList<>();


    public OT() {}

    public OT(DI di,String codeOT,Equipement equipement,LocalDateTime tempsIntervention, LocalDateTime dateExecution, User technicien, StatutOT statut, Priorite priorite, TypeOT typeOT, String compteRendu, User superviseur) {
        this.di = di;
        this.equipement=equipement;
        this.dateExecution = dateExecution;
        this.technicien = technicien;
        this.statut = statut;
        this.superviseur = superviseur;
        this.priorite=priorite;
        this.typeOT=typeOT;
        this.compteRendu=compteRendu;
        this.tempsIntervention=tempsIntervention;
        this.codeOT=codeOT;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    @PostPersist
    public void genererCode() {
        int year = java.time.LocalDate.now().getYear() % 100;
        this.codeOT = String.format("DI%06d%02d", this.id, year);
    }
    
    public String getCodeOT() {
		return codeOT;
	}

	public void setCodeOT(String codeOT) {
		this.codeOT = codeOT;
	}

	public List<Document> getDocuments() {
		return documents;
	}

	public void setDocuments(List<Document> documents) {
		this.documents = documents;
	}
	

	public String getPdfCompteRendu() {
		return pdfCompteRendu;
	}

	public void setPdfCompteRendu(String pdfCompteRendu) {
		this.pdfCompteRendu = pdfCompteRendu;
	}

	public DI getDi() { return di; }
    public void setDi(DI di) { this.di = di; }
    
    public Equipement getEquipement() { return equipement; }
    public void setEquipement(Equipement equipement) { this.equipement = equipement; }

    public LocalDateTime getDateExecution() { return dateExecution; }
    public void setDateExecution(LocalDateTime dateExecution) { this.dateExecution = dateExecution; }

    public User getTechnicien() { return technicien; }
    public void setTechnicien(User technicien) { this.technicien = technicien; }
    
	
	  public User getSuperviseur() { return superviseur; } public void
	  setSuperviseur(User superviseur) { this.superviseur = superviseur; }
	 

    public StatutOT getStatut() { return statut; }
    public void setStatut(StatutOT statut) { this.statut = statut; }
    
    public String getCompteRendu() { return compteRendu; }
    public void setCompteRendu(String compteRendu) { this.compteRendu = compteRendu; }
    
    public Priorite getPriorite() { return priorite; }
    public void setPriorite(Priorite priorite) { this.priorite = priorite; }
    
    public TypeOT getTypeOT() { return typeOT; }
    public void setTypeOT(TypeOT typeOT) { this.typeOT = typeOT; }
    
    public LocalDateTime getTempsIntervention() { return tempsIntervention; }
    public void setTempsIntervention(LocalDateTime tempsIntervention) { this.tempsIntervention = tempsIntervention; }
}