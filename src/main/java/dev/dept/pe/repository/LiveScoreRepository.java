package dev.dept.pe.repository;

import dev.dept.pe.model.LiveScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LiveScoreRepository extends JpaRepository<LiveScore, Long> {
    List<LiveScore> findByMatchStatus(String matchStatus);
    List<LiveScore> findBySportType(String sportType);
}
