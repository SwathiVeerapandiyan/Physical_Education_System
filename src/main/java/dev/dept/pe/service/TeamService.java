package dev.dept.pe.service;

import dev.dept.pe.dto.TeamDto;
import java.util.List;

public interface TeamService {
    TeamDto create(TeamDto dto);
    TeamDto getById(Long id);
    List<TeamDto> getAll();
    List<TeamDto> getBySportId(Long sportId);
    TeamDto update(Long id, TeamDto dto);
    void delete(Long id);
}
