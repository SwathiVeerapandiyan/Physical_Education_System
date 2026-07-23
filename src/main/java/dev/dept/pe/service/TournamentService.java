package dev.dept.pe.service;

import dev.dept.pe.dto.TournamentDto;
import java.util.List;

public interface TournamentService {
    TournamentDto create(TournamentDto dto);
    TournamentDto getById(Long id);
    List<TournamentDto> getAll();
    List<TournamentDto> getByStatus(String status);
    TournamentDto update(Long id, TournamentDto dto);
    void delete(Long id);
}
