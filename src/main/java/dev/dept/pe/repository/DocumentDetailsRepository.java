package dev.dept.pe.repository;

import dev.dept.pe.model.DocumentDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocumentDetailsRepository extends JpaRepository<DocumentDetails, Long> {
    Optional<DocumentDetails> findByUserFormId(Long userFormId);
}
