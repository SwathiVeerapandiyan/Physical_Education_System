package dev.dept.pe.service;

import dev.dept.pe.dto.MatchDto;
import java.util.List;

public interface MatchService {
    MatchDto create(MatchDto dto);
    MatchDto getById(Long id);
    List<MatchDto> getAll();
    List<MatchDto> getByTournamentId(Long tournamentId);
    MatchDto update(Long id, MatchDto dto);
    void delete(Long id);
}
