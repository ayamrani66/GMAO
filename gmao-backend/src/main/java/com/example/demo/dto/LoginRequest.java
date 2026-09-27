package com.example.demo.dto;

public class LoginRequest {

    private String mail;
    private String password;
    
    
	public LoginRequest() {
	}
	public LoginRequest(String mail, String password) {
		super();
		this.mail = mail;
		this.password = password;
	}
	public String getMail() {
		return mail;
	}
	public void setMail(String mail) {
		this.mail = mail;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}


}