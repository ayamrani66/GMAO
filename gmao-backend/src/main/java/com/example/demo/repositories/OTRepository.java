package com.example.demo.repositories;

import java.util.List;


import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.models.*;

public interface OTRepository extends JpaRepository<OT, Long> {
    OT findById(String id);
    List<OT> findByEquipementId(Long equipementId);
    List<OT> findByTechnicienOrSuperviseurOrderByIdDesc(User technicien, User superviseur);
}
