package com.example.demo.services;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.models.*;
import com.example.demo.repositories.NotificationRepository;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserService userService;

    public NotificationService(NotificationRepository notificationRepository,
                                UserService userService) {
        this.notificationRepository = notificationRepository;
        this.userService = userService;
    }

    public List<Notification> getMyNotifications() {
        User user = userService.getCurrentUser();
        return notificationRepository.findByUserOrderByDateCreationDesc(user);
    }

    public long countUnread() {
        User user = userService.getCurrentUser();
        return notificationRepository.countByUserAndLuFalse(user);
    }

    public void markAllAsRead() {
        User user = userService.getCurrentUser();
        List<Notification> notifs = notificationRepository.findByUserOrderByDateCreationDesc(user);
        notifs.forEach(n -> n.setLu(true));
        notificationRepository.saveAll(notifs);
    }

    // Appelé depuis DIService et OTService
    public void creerNotification(User user, String message) {
        Notification notif = new Notification();
        notif.setUser(user);
        notif.setMessage(message);
        notif.setDateCreation(LocalDateTime.now());
        notificationRepository.save(notif);
    }
}
