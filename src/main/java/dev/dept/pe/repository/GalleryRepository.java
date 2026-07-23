package dev.dept.pe.repository;

import dev.dept.pe.model.Gallery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GalleryRepository extends JpaRepository<Gallery, Long> {
    List<Gallery> findByIsActive(Boolean isActive);
    List<Gallery> findByEventNameIgnoreCase(String eventName);
    List<Gallery> findByIsActiveAndEventNameIgnoreCase(Boolean isActive, String eventName);
}
