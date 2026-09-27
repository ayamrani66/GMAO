package com.example.demo.repositories;

import com.example.demo.models.PieceRechange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PieceRechangeRepository extends JpaRepository<PieceRechange, Long> {

    Optional<PieceRechange> findByCode(String code);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdNot(String code, Long id);

    List<PieceRechange> findByNomContainingIgnoreCase(String nom);

    // PDR dont le stock est en dessous du seuil d'alerte
    @Query("SELECT p FROM PieceRechange p WHERE p.quantiteStock <= p.seuilAlerte AND p.seuilAlerte > 0")
    List<PieceRechange> findPdrEnAlerte();
}