package com.example.demo.dto;

public class UpdateProfileRequest {
  private String nomComplet;
  private String telephone;
  private String oldPassword;  
  private String newPassword;
  public String getNomComplet() {
	return nomComplet;
  }
  public void setNomComplet(String nomComplet) {
	this.nomComplet = nomComplet;
  }
  public String getTelephone() {
	return telephone;
  }
  public void setTelephone(String telephone) {
	this.telephone = telephone;
  }
  public String getOldPassword() {
	return oldPassword;
  }
  public void setOldPassword(String oldPassword) {
	this.oldPassword = oldPassword;
  }
  public String getNewPassword() {
	return newPassword;
  }
  public void setNewPassword(String newPassword) {
	this.newPassword = newPassword;
  }  

  

}