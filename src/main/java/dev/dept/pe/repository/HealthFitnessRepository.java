package dev.dept.pe.repository;

import dev.dept.pe.model.HealthFitness;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HealthFitnessRepository extends JpaRepository<HealthFitness, Long> {
    List<HealthFitness> findByUserId(Integer userId);
    Optional<HealthFitness> findFirstByUserIdOrderByCreatedAtDesc(Integer userId);
}
