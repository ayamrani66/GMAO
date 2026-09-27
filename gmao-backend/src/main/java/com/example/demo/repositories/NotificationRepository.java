package com.example.demo.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.models.Notification;
import com.example.demo.models.User;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByDateCreationDesc(User user);
    long countByUserAndLuFalse(User user);
}
