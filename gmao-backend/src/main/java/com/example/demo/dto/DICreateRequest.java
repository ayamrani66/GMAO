package com.example.demo.dto;

import com.example.demo.models.Priorite;
import com.example.demo.models.Source;

public class DICreateRequest {

    private Long equipementId;
    private String description;
    private Source source;
    private Priorite priorite;
    
    
	public DICreateRequest(Long equipementId, String description, Source source, Priorite priorite) {
		super();
		this.equipementId = equipementId;
		this.description = description;
		this.source = source;
		this.priorite = priorite;
	}
	public Long getEquipementId() {
		return equipementId;
	}
	public void setEquipementId(Long equipementId) {
		this.equipementId = equipementId;
	}
	public String getDescription() {
		return description;
	}
	public void setDescription(String description) {
		this.description = description;
	}
	public Source getSource() {
		return source;
	}
	public void setSource(Source source) {
		this.source = source;
	}
	public Priorite getPriorite() {
		return priorite;
	}
	public void setPriorite(Priorite priorite) {
		this.priorite = priorite;
	}

    
}
