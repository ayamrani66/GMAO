package com.example.demo.models;

import java.time.LocalDateTime;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import jakarta.persistence.*;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonProperty;

@Entity
@Table(name = "users")
public class User implements UserDetails{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, name="mail",length=50)
    private String mail;
    
    @Column(name="nom_complet",length=50)
    private String nomComplet;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false, name="password")
    private String password;
    
    @Column(name="telephone",length=10)
    private String telephone;

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Role role;
    
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() { return createdAt; }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // On transforme le Role enum en GrantedAuthority
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return mail;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
    
    public User(){}
    
    

	public User(String mail, String nomComplet, String password, String telephone, Role role) {
		super();
		this.mail = mail;
		this.nomComplet = nomComplet;
		this.password = password;
		this.telephone = telephone;
		this.role = role;
	}

	public Long getId() { return id;}
	public void setId(Long id) { this.id = id;}

	public String getPassword() {return password;}
	public void setPassword(String password) {this.password = password;}

	public String getTelephone() {return telephone;}
	public void setTelephone(String telephone) {this.telephone = telephone;}

	public Role getRole() {return role;}
	public void setRole(Role role) {this.role = role;}

	public String getMail() {return mail;}
	public void setMail(String mail) {this.mail = mail;}

	public String getNomComplet() {return nomComplet;}
	public void setNomComplet(String nomComplet) {this.nomComplet = nomComplet;}  
    
}