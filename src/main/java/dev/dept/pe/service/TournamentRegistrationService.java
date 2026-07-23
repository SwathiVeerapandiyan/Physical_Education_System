package dev.dept.pe.service;

import dev.dept.pe.dto.TournamentRegistrationDto;
import java.util.List;

public interface TournamentRegistrationService {
    TournamentRegistrationDto create(TournamentRegistrationDto dto);
    TournamentRegistrationDto getById(Long id);
    List<TournamentRegistrationDto> getByTournamentId(Long tournamentId);
    List<TournamentRegistrationDto> getByTeamId(Long teamId);
    TournamentRegistrationDto update(Long id, TournamentRegistrationDto dto);
    void delete(Long id);
}
