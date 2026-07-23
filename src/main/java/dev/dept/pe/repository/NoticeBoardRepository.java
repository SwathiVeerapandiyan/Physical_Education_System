package dev.dept.pe.repository;

import dev.dept.pe.model.NoticeBoard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeBoardRepository extends JpaRepository<NoticeBoard, Long> {
    List<NoticeBoard> findByIsActive(Boolean isActive);
    List<NoticeBoard> findByCategory(String category);
}
