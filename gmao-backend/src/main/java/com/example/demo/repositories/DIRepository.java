package com.example.demo.repositories;

import java.util.List;


import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.models.*;

public interface DIRepository extends JpaRepository<DI, Long> {
    DI findById(String id);
    List<DI> findByEquipementId(Long equipementId);
    List<DI> findByDemandeurOrderByDateDemandeDesc(User demandeur);
    List<DI> findByStatut(StatutDI statut);
}
