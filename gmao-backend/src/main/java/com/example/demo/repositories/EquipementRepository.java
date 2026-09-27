package com.example.demo.repositories;

import com.example.demo.models.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EquipementRepository extends JpaRepository<Equipement, Long> {
    Equipement findByCodeEquipement(String codeEquipement);
    boolean existsByCodeEquipement(String codeEquipement);
}
