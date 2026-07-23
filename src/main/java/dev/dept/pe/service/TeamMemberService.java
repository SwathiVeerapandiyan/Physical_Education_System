package dev.dept.pe.service;

import dev.dept.pe.dto.TeamMemberDto;
import java.util.List;

public interface TeamMemberService {
    TeamMemberDto create(TeamMemberDto dto);
    TeamMemberDto getById(Long id);
    List<TeamMemberDto> getByTeamId(Long teamId);
    List<TeamMemberDto> getByStudentId(Long studentId);
    void delete(Long id);
}
