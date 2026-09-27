package com.example.demo.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.models.Role;
import com.example.demo.models.User;

public interface UserRepository extends JpaRepository<User, Long>{
	Optional<User> findByMail(String mail);
	List<User> findByRole(Role role);
	boolean existsByMail(String mail);
}
