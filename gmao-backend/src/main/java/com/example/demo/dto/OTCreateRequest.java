package com.example.demo.dto;

public class OTCreateRequest {
	private Long equipementId;
    private Long technicienId;
    private Long diId;
    private String priorite;
    private String typeOT;

    public Long getEquipementId() { return equipementId; }
    public void setEquipementId(Long equipementId) { this.equipementId = equipementId; }
    public Long getTechnicienId() { return technicienId; }
    public void setTechnicienId(Long technicienId) { this.technicienId = technicienId; }
    public String getPriorite() { return priorite; }
    public void setPriorite(String priorite) {
}
	public Long getDiId() {
		return diId;
	}
	public void setDiId(Long diId) {
		this.diId = diId;
	}
	public String getTypeOT() {
		return typeOT;
	}
	public void setTypeOT(String typeOT) {
		this.typeOT = typeOT;
	}
}
