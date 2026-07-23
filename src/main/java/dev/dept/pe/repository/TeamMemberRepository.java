package dev.dept.pe.repository;

import dev.dept.pe.model.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    List<TeamMember> findByTeamId(Long teamId);
    List<TeamMember> findByStudentId(Long studentId);
    Optional<TeamMember> findByTeamIdAndStudentId(Long teamId, Long studentId);
}
